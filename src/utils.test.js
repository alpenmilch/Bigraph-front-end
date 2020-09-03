import convert from "./utils/jsonconvert";


test('convertor', ()=>{
    var data = require('./data/1.json')
    convert(data);
});

test('test', ()=>{
    let p = new Promise(resolve => {
            console.log(1)
            resolve('a')
            console.log(2)
            return new Promise(resolve=>{
                    console.log(4)
                    resolve('b')
                    console.log(5)
                    return new Promise(resolve=>{
                        console.log('6')
                        resolve('c')
                        return resolve
                        }
                    )
                }
            )
        }
    ).then(res=>{
        console.log(res)
    })
    p.then(res=> {
        console.log(res)
    })
    p.finally(()=>{console.log(11)})
        .then(res=>{console.log(res)})
});

test('t2',()=>{
    var d = require('./data/1.json')
    console.log(d)
})