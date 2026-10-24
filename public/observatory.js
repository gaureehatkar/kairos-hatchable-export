(()=> {
  const T = window.THREE;
  if (!T) return;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function mount({host,assets,edges,selected,mode='overview',filter='all',onSelect=()=>{}}){
    if(!host || !T) return ()=>{};
    host.querySelectorAll('canvas[data-kairos-scene]').forEach(c=>c.remove());
    const scene=new T.Scene(); scene.background=new T.Color(0x000000); scene.fog=new T.FogExp2(0x000000,.012);
    const camera=new T.PerspectiveCamera(43,Math.max(1,host.clientWidth)/Math.max(1,host.clientHeight),.1,180);
    camera.position.set(0,13,26);
    const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    renderer.domElement.dataset.kairosScene='true'; renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)); renderer.setSize(host.clientWidth||720,host.clientHeight||490);
    renderer.outputColorSpace=T.SRGBColorSpace; renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.0; renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
    host.prepend(renderer.domElement);
    scene.add(new T.HemisphereLight(0xdce9ed,0x26313a,1.35));
    const key=new T.DirectionalLight(0xffead2,1.75);key.position.set(-10,18,9);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-24;key.shadow.camera.right=24;key.shadow.camera.top=18;key.shadow.camera.bottom=-18;key.shadow.bias=-0.00025;scene.add(key);
    const rim=new T.PointLight(0x80cdbd,16,45,2);rim.position.set(9,7,-4);scene.add(rim);
    const warm=new T.PointLight(0xe7b989,12,35,2);warm.position.set(-8,5,8);scene.add(warm);
    const root=new T.Group();scene.add(root); const structure=new T.Group();root.add(structure);const dataLayer=new T.Group();root.add(dataLayer);
    const mats={
      floor:new T.MeshStandardMaterial({color:0x29343a,roughness:.82,metalness:.16}),
      wall:new T.MeshStandardMaterial({color:0x38434a,roughness:.76,metalness:.12}),
      dark:new T.MeshStandardMaterial({color:0x1c272e,roughness:.48,metalness:.48}),
      glass:new T.MeshPhysicalMaterial({color:0x8cb7b7,roughness:.24,metalness:.25,transparent:true,opacity:.20,transmission:.15}),
      trim:new T.MeshStandardMaterial({color:0xb6a78c,roughness:.42,metalness:.58}),
      source:new T.MeshStandardMaterial({color:0x79c6b0,roughness:.3,metalness:.25,emissive:0x163f36,emissiveIntensity:.45}),
      transform:new T.MeshStandardMaterial({color:0xb3a3e5,roughness:.3,metalness:.3,emissive:0x322752,emissiveIntensity:.38}),
      output:new T.MeshStandardMaterial({color:0x88b5e4,roughness:.28,metalness:.32,emissive:0x1d3856,emissiveIntensity:.4})
    };
    function box(parent,x,y,z,w,h,d,mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
    function line(parent,pts,color=0x7ca7a6,opacity=.48){const g=new T.BufferGeometry().setFromPoints(pts.map(p=>new T.Vector3(...p)));const m=new T.Line(g,new T.LineBasicMaterial({color,transparent:true,opacity}));parent.add(m);return m}
    // Built environment: raised floor, architectural perimeter, ribs, glazing and practical light strips.
    box(structure,0,-1.25,0,34,.5,25,mats.floor);
    box(structure,0,-.98,-12.1,34,.12,.3,mats.trim);box(structure,0,-.98,12.1,34,.12,.3,mats.trim);
    box(structure,-16.7,1,0,.45,4.2,24.5,mats.wall);box(structure,16.7,1,0,.45,4.2,24.5,mats.wall);
    box(structure,0,3.1,-12,.4,1.6,24,mats.wall);
    for(let x=-15;x<=15;x+=3){box(structure,x,1,-11.72,.07,3.5,.12,mats.trim);box(structure,x,1,11.72,.07,3.5,.12,mats.trim)}
    for(let z=-10;z<=10;z+=2.5){box(structure,-16.35,1,z,.12,3.2,.06,mats.trim);box(structure,16.35,1,z,.12,3.2,.06,mats.trim)}
    // Recessed ceiling beams create scale and real architectural perspective.
    for(let x=-15;x<=15;x+=5){box(structure,x,3.2,0,.16,.18,23,mats.dark);box(structure,x,3.08,0,.035,.025,22,new T.MeshBasicMaterial({color:0xc1b28f}))}
    const floorGrid=new T.GridHelper(32,32,0x74847e,0x46565b);floorGrid.position.y=-.985;floorGrid.material.transparent=true;floorGrid.material.opacity=.22;structure.add(floorGrid);
    // Central inset floor medallion and subtle rings.
    const med=new T.Mesh(new T.CylinderGeometry(5.1,5.1,.08,96),new T.MeshStandardMaterial({color:0x202c31,roughness:.6,metalness:.35}));med.position.set(0,-.91,0);structure.add(med);
    for(const r of [3.8,4.35,4.9]){const ring=new T.Mesh(new T.TorusGeometry(r,.025,8,100),new T.MeshStandardMaterial({color:0x9aaf9e,metalness:.55,roughness:.35,emissive:0x273f39,emissiveIntensity:.5}));ring.rotation.x=Math.PI/2;ring.position.y=-.85;structure.add(ring)}
    const filtered=assets.filter(a=>filter==='all'||a.schema===filter);
    const positions={},nodeMeshes=[],animated=[],edgeMeshes=[];
    const clusters={commerce:[-8,0],billing:[-8,-5],analytics:[0,0],bi:[8,0],ml_features:[8,5],support:[-8,5],operations:[0,6]};
    filtered.forEach((a,i)=>{
      let x,z;
      if(mode==='lineage'){const lane={'a1':-12,'a2':-12,'a3':-12,'a9':-12,'a4':-4,'a10':-4,'a11':-4,'a5':4,'a6':4,'a12':4,'a8':11,'a7':12};x=lane[a.id]??(-12+(i%4)*8);z=(i%4-1.5)*3.4}
      else if(mode==='clusters'){const c=clusters[a.schema]||[0,0];x=c[0]+Math.cos(i*2.4)*1.6;z=c[1]+Math.sin(i*2.4)*1.6}
      else {const ang=i/Math.max(1,filtered.length)*Math.PI*2;x=Math.cos(ang)*9.3;z=Math.sin(ang)*6.6}
      const y=.35+(i%3)*.15;positions[a.id]=new T.Vector3(x,y,z);
      // Each asset is a compact physical-looking instrument/server plinth, not a floating sphere.
      const group=new T.Group();group.position.copy(positions[a.id]);group.scale.setScalar(1.12);dataLayer.add(group);
      const colorMat=mats[a.kind]||mats.transform;
      box(group,0,-.12,0,1.65,.2,1.12,mats.dark);
      box(group,0,.13,0,1.42,.42,.94,colorMat);
      box(group,0,.37,0,1.12,.055,.72,mats.trim);
      for(let k=-1;k<=1;k++){const led=new T.Mesh(new T.SphereGeometry(.045,10,8),new T.MeshBasicMaterial({color:a.kind==='source'?0x9cebd2:a.kind==='output'?0xa8d3ff:0xd2c3ff}));led.position.set(k*.22,.42,.39);group.add(led)}
      const halo=new T.Mesh(new T.TorusGeometry(a.id===selected?1.05:.84,.018,6,48),new T.MeshBasicMaterial({color:a.id===selected?0xf0d6a2:0x8da6a0,transparent:true,opacity:a.id===selected?.95:.42}));halo.rotation.x=Math.PI/2;halo.position.y=-.03;group.add(halo);
      group.userData.asset=a;nodeMeshes.push(group);
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');
      ctx.fillStyle='rgba(17,27,32,.94)';ctx.fillRect(5,5,502,118);ctx.strokeStyle=a.id===selected?'#e7d2a7':'#687d7c';ctx.lineWidth=2;ctx.strokeRect(6,6,500,116);
      ctx.fillStyle='#f1f1e9';ctx.font='600 29px Arial';ctx.fillText(a.name.length>25?a.name.slice(0,24)+'…':a.name,22,49);
      ctx.fillStyle='#b7c4bd';ctx.font='22px Arial';ctx.fillText(a.schema+'  /  '+a.kind,22,83);
      const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
      const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false}));sprite.position.set(x,1.55,z);sprite.scale.set(3.75,.94,1);dataLayer.add(sprite);
    });
    // Structural conduit lines are routed through low, tidy waypoints; particles move along real relationships.
    edges.forEach(e=>{const from=positions[e[0]],to=positions[e[1]];if(!from||!to)return;
      const mid1=new T.Vector3(from.x,(from.y+to.y)/2+.55,from.z),mid2=new T.Vector3(to.x,(from.y+to.y)/2+.55,to.z);
      const curve=new T.CatmullRomCurve3([from.clone().add(new T.Vector3(0,.1,0)),mid1,mid2,to.clone().add(new T.Vector3(0,.1,0))]);
      const tube=new T.Mesh(new T.TubeGeometry(curve,28,.025,6,false),new T.MeshStandardMaterial({color:0x445566,metalness:.35,roughness:.4,emissive:0x111111,emissiveIntensity:1.0,transparent:true,opacity:.40}));tube.userData={from:e[0],to:e[1]};edgeMeshes.push(tube);dataLayer.add(tube);
      const bead=new T.Mesh(new T.SphereGeometry(.075,10,8),new T.MeshBasicMaterial({color:0xd7c69f}));dataLayer.add(bead);animated.push({bead,curve,phase:Math.random()});
    });
    // Custom 3D Rendered Model: Kairos Data Core Monolith & Holographic Pulsar Rings
    const coreGroup = new T.Group();
    coreGroup.position.set(0, 1.2, 0);
    structure.add(coreGroup);

    // Central Monolith Pillar
    const monolithGeo = new T.BoxGeometry(1.4, 4.2, 1.4);
    const monolithMat = new T.MeshStandardMaterial({color: 0x1f2937, roughness: 0.2, metalness: 0.85, emissive: 0x0f172a, emissiveIntensity: 0.6});
    const monolith = new T.Mesh(monolithGeo, monolithMat);
    monolith.castShadow = true;
    monolith.receiveShadow = true;
    coreGroup.add(monolith);

    // Glowing vertical energy runed fins on monolith
    for(let a=0; a<4; a++) {
      const angle = (a / 4) * Math.PI * 2;
      const fin = new T.Mesh(new T.BoxGeometry(0.08, 3.8, 0.4), new T.MeshBasicMaterial({color: 0x5eead4}));
      fin.position.set(Math.cos(angle) * 0.74, 0, Math.sin(angle) * 0.74);
      fin.rotation.y = -angle;
      coreGroup.add(fin);
    }

    // Floating Pulsar Rings
    const rings = [];
    for(let r=0; r<3; r++) {
      const radius = 2.2 + r * 0.75;
      const ringGeo = new T.TorusGeometry(radius, 0.04, 16, 100);
      const ringMat = new T.MeshBasicMaterial({color: r===0? 0x38bdf8 : r===1? 0x00ff9c : 0xa855f7, transparent: true, opacity: 0.75});
      const ringMesh = new T.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2 + (r * 0.2);
      ringMesh.position.y = -0.5 + (r * 0.6);
      coreGroup.add(ringMesh);
      rings.push({mesh: ringMesh, speed: (r % 2 === 0 ? 1 : -1) * (0.008 + r * 0.004)});
    }

    // Floating Data Crystal Orbiters
    const crystalGeo = new T.OctahedronGeometry(0.32, 0);
    const crystalMat = new T.MeshStandardMaterial({color: 0x00ff9c, roughness: 0.1, metalness: 0.9, emissive: 0x00ff9c, emissiveIntensity: 0.8});
    const crystals = [];
    for(let c=0; c<5; c++) {
      const crystal = new T.Mesh(crystalGeo, crystalMat);
      const angle = (c / 5) * Math.PI * 2;
      crystals.push({mesh: crystal, angle, dist: 3.8 + (c % 2 * 0.8), speed: 0.012 + (c * 0.003), height: (c % 2 === 0 ? 0.8 : -0.6)});
      coreGroup.add(crystal);
    }
    // Background architectural consoles and vertical light wells.
    for(const side of [-1,1]){for(let i=0;i<4;i++){const z=-7+i*4.5;box(structure,side*14.4,.1,z,1.1,1.9,2.1,mats.dark);box(structure,side*14.4,.18,z,1.12,.08,1.85,mats.trim);const panel=new T.Mesh(new T.PlaneGeometry(.8,1.1),new T.MeshStandardMaterial({color:0x4b6b6b,emissive:0x274746,emissiveIntensity:.55,roughness:.3,metalness:.25}));panel.position.set(side*13.82,.8,z);panel.rotation.y=side===1?-Math.PI/2:Math.PI/2;structure.add(panel)}}
    const ray=new T.Raycaster(),pointer=new T.Vector2();let down=false,lastX=0,lastY=0,rotY=0,rotX=.1,zoom=1,target=new T.Vector3(0,0,0),raf=0,alive=true,dragMoved=false;
    const updateCamera=()=>{const radius=23/zoom;camera.position.set(target.x+Math.sin(rotY)*radius,target.y+Math.max(-.1,Math.cos(rotX)*radius*.43),target.z+Math.cos(rotY)*radius);camera.lookAt(target)};
    updateCamera();
    const pointerDown=e=>{down=true;dragMoved=false;lastX=e.clientX;lastY=e.clientY;host.setPointerCapture?.(e.pointerId)};
    let hovered=null;const pointerMove=e=>{if(!down){const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(nodeMeshes,true);let o=hits[0]?.object;while(o&&!o.userData.asset)o=o.parent;const next=o?.userData.asset?o:null;if(next!==hovered){if(hovered)hovered.scale.setScalar(1.12);hovered=next;if(hovered)hovered.scale.setScalar(1.18)}renderer.domElement.style.cursor=hovered?'pointer':'grab';return}const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>2)dragMoved=true;rotY-=dx*.005;rotX=clamp(rotX+dy*.003,-.5,1.0);lastX=e.clientX;lastY=e.clientY;updateCamera()};
    const pointerUp=()=>{down=false};
    const wheel=e=>{zoom=clamp(zoom*(e.deltaY>0?.92:1.08),.55,1.75);updateCamera()};
    const click=e=>{if(dragMoved)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(nodeMeshes,true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.asset)o=o.parent;if(o?.userData.asset){const id=o.userData.asset.id;if(positions[id])target.copy(positions[id]);const downSet=new Set(), upSet=new Set();const dq=[id]; while(dq.length){const cur=dq.pop();downSet.add(cur);edges.filter(ed=>ed[0]===cur).forEach(ed=>{if(!downSet.has(ed[1]))dq.push(ed[1])});} const uq=[id]; while(uq.length){const cur=uq.pop();upSet.add(cur);edges.filter(ed=>ed[1]===cur).forEach(ed=>{if(!upSet.has(ed[0]))uq.push(ed[0])});} nodeMeshes.forEach(n=>{const h=n.children.find(c=>c.geometry?.type==='TorusGeometry');if(h){const nid=n.userData.asset.id;let c=0x223344,op=0.15;if(nid===id){c=0xffffff;op=1.0}else if(downSet.has(nid)){c=0xff3333;op=0.9}else if(upSet.has(nid)){c=0x3388ff;op=0.9} h.material.color.setHex(c);h.material.opacity=op;h.material.needsUpdate=true}}); edgeMeshes.forEach(t=>{const f=t.userData.from,to=t.userData.to;let c=0x223344,em=0x000000,op=0.15;if(downSet.has(f)&&downSet.has(to)){c=0xff3333;em=0xff0000;op=0.9;}else if(upSet.has(f)&&upSet.has(to)){c=0x3388ff;em=0x0055ff;op=0.9;} t.material.color.setHex(c);t.material.emissive.setHex(em);t.material.opacity=op;t.material.needsUpdate=true});updateCamera();onSelect(id)}}};
    const zoomIn=()=>{zoom=clamp(zoom*1.15,.55,1.75);updateCamera()},zoomOut=()=>{zoom=clamp(zoom/1.15,.55,1.75);updateCamera()},resetCamera=()=>{target.set(0,0,0);rotY=0;rotX=.1;zoom=1;updateCamera()};
    const zoomInButtons=host.querySelectorAll('[data-action="zoom-in"]'),zoomOutButtons=host.querySelectorAll('[data-action="zoom-out"]'),resetButtons=host.querySelectorAll('[data-action="reset-3d"]');zoomInButtons.forEach(b=>b.addEventListener('click',zoomIn));zoomOutButtons.forEach(b=>b.addEventListener('click',zoomOut));resetButtons.forEach(b=>b.addEventListener('click',resetCamera));
    renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',pointerUp);renderer.domElement.addEventListener('click',click);renderer.domElement.addEventListener('wheel',wheel,{passive:true});
    const motionReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('kairos_reduceMotion')==='true';const animate=()=>{if(!alive)return;raf=requestAnimationFrame(animate);if(!motionReduced){const t=performance.now()*.00015;animated.forEach(p=>{const q=p.curve.getPoint((t+p.phase)%1);p.bead.position.copy(q)});if(coreGroup){coreGroup.rotation.y += 0.005;rings.forEach(r=>{r.mesh.rotation.z += r.speed});crystals.forEach(c=>{c.angle += c.speed;c.mesh.position.x = Math.cos(c.angle) * c.dist;c.mesh.position.z = Math.sin(c.angle) * c.dist;c.mesh.position.y = c.height + Math.sin(performance.now()*0.002 + c.angle)*0.2;c.mesh.rotation.x += 0.02;c.mesh.rotation.y += 0.03;})}}renderer.render(scene,camera)};
    animate();
    const resize=()=>{if(!host.isConnected)return;camera.aspect=Math.max(1,host.clientWidth)/Math.max(1,host.clientHeight);camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)};
    window.addEventListener('resize',resize);
    const n=document.querySelector('#sceneNodes'),ed=document.querySelector('#sceneEdges');if(n)n.textContent=filtered.length;if(ed)ed.textContent=edges.filter(e=>positions[e[0]]&&positions[e[1]]).length;
    const roomTitle=host.querySelector('.observatory-caption strong');if(roomTitle)roomTitle.textContent=mode==='lineage'?'Lineage Map (Updated v4)':mode==='clusters'?'Cluster Laboratory (Updated v4)':'Central Observatory (Updated v4)';
    return ()=>{alive=false;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointermove',pointerMove);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('pointercancel',pointerUp);renderer.domElement.removeEventListener('click',click);renderer.domElement.removeEventListener('wheel',wheel);zoomInButtons.forEach(b=>b.removeEventListener('click',zoomIn));zoomOutButtons.forEach(b=>b.removeEventListener('click',zoomOut));resetButtons.forEach(b=>b.removeEventListener('click',resetCamera));scene.traverse(o=>{o.geometry?.dispose?.();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose?.());else o.material.dispose?.()}if(o.material?.map)o.material.map.dispose?.()});renderer.dispose();renderer.domElement.remove()};
  }
  window.KairosObservatory={mount};
})();