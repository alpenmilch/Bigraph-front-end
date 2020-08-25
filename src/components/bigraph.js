import * as d3 from "d3"


export default class Bigraph {

    constructor() {
        this.width = 800;
        this.height = 800;
    }



    initialize(data) {
        const width = this.width;
        const height = this.height;
        const rad = 0.7 * height / 2

        const pack = data => d3.pack().size([width * 0.5, height * 0.5]).padding(20)(d3.hierarchy(data).sum(d => 1).sort((a, b) => b.value - a.value));
        const root = pack(data.root);
        var nodes = root.descendants();
        var links = root.links();
        nodes.map(d=>{d.x += width/4; d.y += height/4})

        var namespace = Array.from(new Set(nodes.map(d => d.data.name))).sort(d3.ascending)
        var color = d3.scaleOrdinal(namespace, d3.quantize(d3.interpolateRainbow, namespace.length + 1))

        color = new Map(namespace.map(d => [d, color(d)]))

        this.depth = root.height;
        this.legends = new Array()
        namespace.slice(1).map(d=> this.legends.push({label:d,color:color.get(d)}))

        var edge = data.edges
        var port = data.ports
        var inner = data.inners
        var outer = data.outers
        var unnamed = data.unnamed
        var all = nodes.concat(port).concat(inner).concat(outer).concat(unnamed)
        var nodeById = new Map(all.map(d => d.id != null ? [d.id, d] : [d.data.id, d]))
        edge = edge.map(({source, target}) => ({source: nodeById.get(source), target: nodeById.get(target)}))
        var portlink = port.map(d => ({source: nodeById.get(d.parent), target: nodeById.get(d.id)}))
        port.map(function (d) {
            d.parent = nodeById.get(d.parent)
        })
        unnamed.map(d=>{d.x=width/2; d.y=height/2})
        inner.concat(outer).map((d,i,n)=>{
            d.x = width/2 + rad*Math.cos((i/n.length)*2*Math.PI);
            d.y = height/2 + rad*Math.sin((i/n.length)*2*Math.PI);
        })
        port.map(d=>{d.x = d.parent.x;d.y=d.parent.y})

        var svg;

        this.render = function render(id) {

            const drag = simulation => {

                function dragstarted(d) {
                    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }

                function dragged(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                }

                function dragended(d) {
                    if (!d3.event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }

                return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended);
            };


            function isolate(force, filter) {
                var initialize = force.initialize
                force.initialize = function (d) {
                    initialize(d.filter(filter));
                };
                return force;
            }

            var simulation = d3.forceSimulation(all)
                .force("collide", isolate(collide(), function (d) {
                    return d.parent != null
                }).radius(function (d) {
                    if (d.r != null) return d.r;
                    else return 3;
                }).strength(1))
                .force("link", link(links).distance(d => d.source.r - d.target.r).strength(1))
                .force("plink", link(portlink).distance(d => d.source.r - 4).strength(2))
                .force("edge", link(edge).distance(1).strength(0.03))
                .force("radial", isolate(d3.forceRadial(), function (d) {
                    return d.type === "outer" | d.type === "inner"
                }).radius(rad).strength(1).x(width / 2).y(height / 2))
                .force("manybody", isolate(d3.forceManyBody(), function (d) {
                    return d.type === "outer" | d.type === "inner" | d.type === "port"
                }).distanceMin(10).strength(-5))
                .force("center", isolate(d3.forceCenter(width / 2, height / 2), function (d) {
                    return d === root
                }))
                .velocityDecay(0.1)
                .alphaDecay(0.02);


            svg = d3.select(id)
                .attr("viewBox", `-${0} -${0} ${width} ${height}`)
                .style("display", "block")
                .style("margin", "0 -14px")
                .style("background", "rgb(240,240,240)")
                .style("cursor", "pointer");

            svg.call(d3.zoom()
                .extent([[0, 0], [width, height]])
                .scaleExtent([1, 8])
                .on("zoom", zoomed));

            var node = svg.append("g").attr("class", "circlegraph")
                .selectAll("circle").data(nodes).join("circle")
                .attr("fill", d => d.parent === null|d.data.type==="region" ? null : color.get(d.data.name))
                .attr("fill-opacity", d=> d.parent === null|d.data.type==="region" ? 0:1)
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", d => d.r)
                .attr("stroke-width", 3)
                .attr("stroke", d => d3.color(color.get(d.data.name)).brighter(2))
                .attr("stroke-opacity",0)
                .attr("stroke-dasharray",d => d.data.type==="region" ? "10,10":null)
                .on("click", d=>null
                )
                .call(drag(simulation));

            var edges = svg.append("g").attr("class", "linegraph")
                .selectAll("line")
                .data(edge)
                .join("line")
                .attr("fill", d => d.source.depth == null ? "rgb(50,50,50)" : color.get(d.depth))
                .attr("stroke", d => d3.color(color.get(null)).brighter(3))
                .attr("stroke-width", 1.5);


            var label = svg.append("g").attr("class", "labelgraph")
                .style("font", "10px sans-serif")
                .attr("pointer-events", "none")
                .attr("text-anchor", "middle")
                .selectAll("text").data(nodes).join("text")
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .attr("fill", d => d3.color(color.get(d.data.name)).darker())
                .style("opacity", 0)
                .style("display", "inline")
                .text(d => d.data.name);
            var backlabel = label.clone(true).lower()
                .style("opacity", 0)
                .style("display", "inline")
                .attr("stroke", d => d3.color(color.get(d.data.name)).brighter(2))
                .attr("stroke-opacity",0)
                .attr("stroke-width", 3)

            var ports = svg.append("g").attr("class", "circlegraph")
                .selectAll("circle").data(port).join("circle")
                .attr("fill", d => d3.color(color.get(d.parent.data.name)).darker(0.5))
                .attr("stroke-width", 1)
                .attr("stroke-opacity",0)
                .attr("stroke",d => d3.color(color.get(d.parent.data.name)).brighter(2))
                .attr("r", 3)
                .attr("cx",d=>d.x)
                .attr("cy",d=>d.y)
                .attr("class", d => "port")
                .call(drag(simulation));

            var inners = svg.append("g").attr("class", "circlegraph")
                .selectAll("circle").data(inner).join("circle")
                .attr("fill", d => "rgb(200,100,100)")
                .attr("stroke", "#999")
                .attr("stroke-width", 1.5)
                .attr("r", 4)
                .attr("cx", d=>d.x)
                .attr("cy", d=>d.y)
                .call(drag(simulation));


            var outers = svg.append("g").attr("class", "circlegraph")
                .selectAll("circle").data(outer).join("circle")
                .attr("fill", d => "rgb(100,100,200)")
                .attr("stroke", "#999")
                .attr("stroke-width", 1.5)
                .attr("r", 4)
                .attr("cx", d=>d.x)
                .attr("cy", d=>d.y)
                .call(drag(simulation));

            var names = svg.append("g").attr("class", "namegraph")
                .style("font", "10px sans-serif")
                .attr("pointer-events", "none")
                .attr("text-anchor", "middle")
                .selectAll("text").data(inner.concat(outer)).join("text")
                .attr("x", d => (d.x + 20))
                .attr("y", d => (d.y + 20))
                .text(d => d.name)
            var backnames = names.clone(true).lower()
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-width", 3)


            var unnameds = svg.append("g").attr("class", "circlegraph")
                .selectAll("circle").data(unnamed).join("circle")
                .attr("fill-opacity", d => 0)
                .attr("r", 5)
                .attr("cx", d=>d.x)
                .attr("cy", d=>d.y)
                .call(drag(simulation));


            var legend = svg.append("g").selectAll("g").data(namespace.slice(1)).join("g")
                .attr("transform", (d, i) => "translate(" + (0.1 * width) + "," + (0.1 * height + i * 20) + ")")
                .call(g => g.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .attr("fill", d => color.get(d))
                    .attr("class", d => "legend color " + d)
                )
                .call(g => g.append("text")
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", "0.35em")
                    .attr("class", d => "legend text " + d)
                    .text(d => d))

            const cg = svg.selectAll(".circlegraph").join("g");
            const lg = svg.selectAll(".linegraph").join("g");
            const ng = svg.selectAll(".namegraph").join("g");
            const allname = ng.selectAll("text").join("text");
            const labels = svg.selectAll(".labelgraph").join("g").selectAll("text").join("text")
            const tgraph = svg.append("g")


            var transform;

            const update = () => textLoc()

            function zoomed() {
                transform = d3.event.transform
                cg.attr("transform", transform);
                lg.attr("transform", transform);
                ng.attr("transform", transform);
                tgraph.attr("transform", transform);
                labels.attr("transform", d => "translate(" + (transform.x + (transform.k - 1) * d.x) + "," + (transform.y + (transform.k - 1) * d.y) + ")")
            }

            simulation.on("tick", () => {
                update();
                allname
                    .attr("x", d => d.x + 20)
                    .attr("y", d => d.y);
                labels
                    .attr("x", d => d.x)
                    .attr("y", d => d.y);
                if (transform != null) {
                    labels.attr("transform", d => "translate(" + (transform.x + (transform.k - 1) * d.x) + "," + (transform.y + (transform.k - 1) * d.y) + ")");
                }
                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                ports
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                inners
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                outers
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                unnameds
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                edges
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
            });

            function showNode(no, bl) {
                let n = node.filter(d => d === no);
                let p = ports.filter(d => d.parent === no);
                let l = labels.filter(d => d === no);
                let b = backlabel.filter(d => d === no);
                n.attr("stroke-opacity", d => bl ? 1 : 0);
                p.attr("stroke", d => bl ? d3.color(color.get(no.data.name)).brighter(2) : null);
                l.style("opacity", d => bl ? 1 : 0);
                b.attr("stroke-opacity", d => bl ? 1:0);
            }
            var fun = {};
            fun.showRange =  function showRange(values){
                nodes.map(d=> values[0]<=d.depth&d.depth<=values[1] ? showNode(d,true):showNode(d,false));
            }
            fun.showLegend = function showLegend(name,bl){
                nodes.map(d=> d.data.name === name? showNode(d,bl):null);
            }
            fun.reset = function reset(){
                svg.selectAll("g").remove();
            }
            fun.changeColor = function changeColor(name,col){
                color.set(name,d3.color(col));
                node.filter(d=>d.data.name===name)
                    .attr("fill",color.get(name))
                    .attr("stroke",d3.color(color.get(name)).brighter(2))
                ports.filter(d=>d.parent.data.name===name)
                    .attr("fill",d3.color(color.get(name)).darker(0.5))
                    .attr("stroke",d3.color(color.get(name)).brighter(2))
                label.filter(d=>d.data.name===name)
                    .attr("fill",d3.color(color.get(name)).darker())
                backlabel.filter(d=>d.data.name===name)
                    .attr("stroke",d3.color(color.get(name)).brighter(2))
                legend.filter(d=>d===name)
                    .select("rect").attr("fill",color.get(name))
            }

            function textLoc(){
                let names = namespace.slice(1)
                const classes = []
                var text
                for(let n of names){
                    classes.push(nodes.filter(d=>d.data.name===n))
                }
                var texts,backs
                function update(){
                    text = classes.map((d,i)=>cluster(d,names[i])).reduce((a,b)=>a.concat(b))
                    texts = tgraph.selectAll("text").data(text).join(
                        enter=>enter.append("text"),
                            update => update,
                            exit => exit.remove()
                        )
                        .style("font", "10px sans-serif")
                        .attr("x", d => d.x)
                        .attr("y", d => d.y)
                        .attr("fill", d => d3.color(color.get(d.name)).darker())
                        .style("text-shadow", d => (
                            "1px 1px 0 " + d3.color(color.get(d.name)).brighter(2) + ","+
                            "1px -1px 0 " + d3.color(color.get(d.name)).brighter(2)  + ","+
                            "-1px 1px 0 " + d3.color(color.get(d.name)).brighter(2)  + ","+
                            "-1px -1px 0 " + d3.color(color.get(d.name)).brighter(2)
                            )
                        )
                        .text(d=>d.name)
                }
                update()
                return update;
            }


            function cluster(nodes , name){
                const r = 20
                const cluster = []

                const quad = d3.quadtree(nodes,x,y)
                quad.visit((d)=>{
                    if(d.length){return ;}
                    let cl = []
                    let stack = []
                    let c = quad.find(x(d.data), y(d.data), r)
                    if (!c) {return ;}
                    stack.push(c)
                    quad.remove(c)
                    while(stack.length>0) {
                        let c = stack.pop()
                        let t = quad.find(x(c), y(c), r)
                        while (t !== undefined) {
                            stack.push(t)
                            quad.remove(t)
                            t = quad.find(x(c), y(c), r)
                        }
                        cl.push(c)
                    }
                    cluster.push(cl)
                })
                const center  = cluster.map(d=>{
                    return {
                        x:d.map(d=>x(d)).reduce((a,b)=>(a+b))/d.length,
                        y:d.map(d=>y(d)).reduce((a,b)=>(a+b))/d.length,
                        size:d.length,
                        name:name,
                    }
                })
                return center;
            }

            return fun;
        }

    }

    draw(id){
        var fun = this.render(id);
        this.showRange = (values) => fun.showRange(values);
        this.showLegend = (name,bl) => fun.showLegend(name,bl);
        this.reset = () => fun.reset();
        this.changeColor = (name,color) => fun.changeColor(name,color);
        this.cluster = () => fun.cluster();
    }

}



// modified code of d3 force collision and link

function x(d) {
  return d.x + d.vx;
}

function y(d) {
  return d.y + d.vy;
}

function collide(radius) {
  var nodes,
      radii,
      strength = 1,
      iterations = 1;

  function force() {
    var i, n = nodes.length,
        tree,
        node,
        xi,
        yi,
        ri,
        ri2;

    for (var k = 0; k < iterations; ++k) {
      tree = d3.quadtree(nodes, x, y).visitAfter(prepare);
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        ri = radii[node.index];
        ri2 = ri * ri;
        xi = node.x + node.vx;
        yi = node.y + node.vy;
        tree.visit(apply);
      }
    }

    function apply(quad, x0, y0, x1, y1) {
      var data = quad.data, rj = quad.r, r = ri + rj;
      if (data) {
        if(data.parent === node.parent){
            if (data.index > node.index) {
                var x = xi - data.x - data.vx,
                  y = yi - data.y - data.vy,
                  l = x * x + y * y;
                if (l < r * r) {
                    if (x === 0) {x = jiggle(); l += x * x;}
                    if (y === 0) {y = jiggle(); l += y * y;}
                    l = (r - (l = Math.sqrt(l))) / l * strength;
                    node.vx += (x *= l) * (r = (rj *= rj) / (ri2 + rj));
                    node.vy += (y *= l) * r;
                    data.vx -= x * (r = 1 - r);
                    data.vy -= y * r;
                }
            }
            return;
        }
      }
      return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
    }
  }

  function prepare(quad) {
    if (quad.data) return quad.r = radii[quad.data.index];
    for (var i = quad.r = 0; i < 4; ++i) {
      if (quad[i] && quad[i].r > quad.r) {
        quad.r = quad[i].r;
      }
    }
  }

  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, node;
    radii = new Array(n);
    for (i = 0; i < n; ++i) {node = nodes[i]; radii[node.index] = +radius(node, i, nodes);}
  }

  force.initialize = function(_) {
    nodes = _;
    initialize();
  };

  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };

  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };

  force.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant$7(+_), initialize(), force) : radius;
  };

  return force;
}

function index(d) {
  return d.index;
}

function find(nodeById, nodeId) {
  var node = nodeById.get(nodeId);
  if (!node) throw new Error("missing: " + nodeId);
  return node;
}

function link(links) {
  var id = index,
      strength = defaultStrength,
      strengths,
      distance = constant$7(30),
      distances,
      nodes,
      count,
      bias,
      iterations = 1;

  if (links == null) links = [];

  function defaultStrength(link) {
    return 1 / Math.min(count[link.source.index], count[link.target.index]);
  }

  function force(alpha) {
    for (var k = 0, n = links.length; k < iterations; ++k) {
      for (var i = 0, link, source, target, x, y, l, b; i < n; ++i) {
        link = links[i];
        source = link.source;
        target = link.target;
        x = target.x + target.vx - source.x - source.vx || jiggle();
        y = target.y + target.vy - source.y - source.vy || jiggle();
        l = Math.sqrt(x * x + y * y);
        if(l > distances[i]){
        l = (l - distances[i]) / l * alpha * strengths[i];
        x *= l;
        y *= l;
        target.vx -= x * (b = bias[i]);
        target.vy -= y * b;
        source.vx += x * (b = 1 - b);
        source.vy += y * b;}
      }
    }
  }

  function initialize() {
    if (!nodes) return;

    var i,
        n = nodes.length,
        m = links.length,
        nodeById = map$1(nodes, id),
        link;

    for (i = 0, count = new Array(n); i < m; ++i) {
      link = links[i];
      link.index = i;
      if (typeof link.source !== "object") link.source = find(nodeById, link.source);
      if (typeof link.target !== "object") link.target = find(nodeById, link.target);
      count[link.source.index] = (count[link.source.index] || 0) + 1;
      count[link.target.index] = (count[link.target.index] || 0) + 1;
    }

    for (i = 0, bias = new Array(m); i < m; ++i) {
      link = links[i];
      bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
    }

    strengths = new Array(m); initializeStrength();
    distances = new Array(m); initializeDistance();
  }

  function initializeStrength() {
    if (!nodes) return;

    for (var i = 0, n = links.length; i < n; ++i) {
      strengths[i] = +strength(links[i], i, links);
    }
  }

  function initializeDistance() {
    if (!nodes) return;

    for (var i = 0, n = links.length; i < n; ++i) {
      distances[i] = +distance(links[i], i, links);
    }
  }

  force.initialize = function(_) {
    nodes = _;
    initialize();
  };

  force.links = function(_) {
    return arguments.length ? (links = _, initialize(), force) : links;
  };

  force.id = function(_) {
    return arguments.length ? (id = _, force) : id;
  };

  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };

  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant$7(+_), initializeStrength(), force) : strength;
  };

  force.distance = function(_) {
    return arguments.length ? (distance = typeof _ === "function" ? _ : constant$7(+_), initializeDistance(), force) : distance;
  };

  return force;
}

function constant$7(x) {
  return function() {
    return x;
  };
}

function jiggle() {
  return (Math.random() - 0.5) * 1e-6;
}

function map$1(object, f) {
  var map = new Map;

  // Copy constructor.
  if (object instanceof Map) object.each(function(value, key) { map.set(key, value); });

  // Index array by numeric index or specified key function.
  else if (Array.isArray(object)) {
    var i = -1,
        n = object.length,
        o;

    if (f == null) while (++i < n) map.set(i, object[i]);
    else while (++i < n) map.set(f(o = object[i], i, object), o);
  }

  // Convert object to map.
  else if (object) for (var key in object) map.set(key, object[key]);

  return map;
}
