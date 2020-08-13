import convert from "./utils/jsonconvert";


test('convertor', ()=>{
    var data = require('./1.json')
    convert(data);
});