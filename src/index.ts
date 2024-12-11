import { initserver } from "./app";

async function init() {

    const app = await initserver(); 
    app.listen(8000,()=>console.log('server started at port 8080'));

}

init();