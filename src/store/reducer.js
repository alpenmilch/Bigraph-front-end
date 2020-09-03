import tpdata from '../data/2.json';

const defaultState = {
    name:'../data/2.json',
    data:tpdata
}
export default (state = defaultState,action)=>{
    switch (action.type){
        case "UPLOAD" : return {
            name:action.name,
            data:action.data
        }
        default : return state ;
    }
}