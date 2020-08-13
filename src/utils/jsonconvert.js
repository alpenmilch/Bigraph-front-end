
export default function convert(data){

    var nodes = new Map(data.nodes.map(
        d=> [d.node_id,Object.create({id:d.node_id,name:d.control.ctrl_name,children:[],type:"control"})]
        ))
    var root = new Object();
    root.id = "root"
    root.name = null;
    var regions = new Array(data.place_graph.num_regions)
    for (let i = 0; i < regions.length; i++) {
        regions[i] = Object.create({type: "region", name:null, id: "region-" + i, children: []});
    }
    data.place_graph.rn.forEach(d=>{
        regions[d.source].children.push(nodes.get(d.target))
    });
    data.place_graph.nn.forEach(d=>{
        nodes.get(d.source).children.push(nodes.get(d.target))
    });
    root.children = regions;
    var inner = []
    var outer = []
    var unnamed = []
    var edges = []
    var port = []
    data.link_graph.forEach(
        (link,i)=>{
            var un = null;
            if (link.inner.length + link.outer.length + link.ports.length > 1) {un = Object.create({id:"un-"+i,type:"unnamed"});unnamed.push(un);}
            if (link.ports.length > 0)  link.ports.forEach((d,j)=>{
                let p = Object.create({id:"port-"+d.node_id+"-"+i+"-"+j,type:"port",parent:d.node_id});
                port.push(p);
                if (un != null) edges.push(Object.create({source:un.id,target:p.id}));
            });
            if (link.inner.length > 0) link.inner.forEach(d=>{
                let n = Object.create({id:"inner-"+i,name:d.name,type:"inner"});
                inner.push(n);
                if (un != null) edges.push(Object.create({source:un.id,target:n.id}))
            });
            if (link.outer.length > 0) link.outer.forEach(d=>{
                let o = Object.create({id:"outer-"+i,name:d.name,type:"outer"})
                outer.push(o)
                if (un != null) edges.push(Object.create({source:un.id,target:o.id}))
            });
        }
    )
    return {root:root,ports:port,inners:inner,outers:outer,unnamed:unnamed,edges:edges}
}