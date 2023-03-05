const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

class Busquedas {
    historial = [];
    dbPath = './db/database.json';
    constructor(){
        //TODO: leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado(){
        return this.historial.map(lugar =>{

            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ');

        });
    }

    get paramsPosition() {
        return {
            'access_key':process.env.positionKey,
            'query':lugar,
            'limit':5,
            'output':'json'
        }
    }

    async ciudad( lugar = '' ){

        try{
            //peticion http
            const instance = axios.create({
                baseURL:`http://api.positionstack.com/v1/forward`,
                params:{
                    'access_key':process.env.positionKey,
                    'query':lugar,
                    'limit':5,
                    'output':'json'
                }
            })
            const resp = await instance.get();
            return resp.data.data.map(lugar => ({
                id:lugar.longitude+','+lugar.latitude,
                nombre:lugar.label,
                lng:lugar.longitude,
                lat:lugar.latitude
            }));

        }catch(error){
            console.log(error);
            return [];
        }

        
    }

    async climaLugar(lat, lon){
        try{
            const instance = axios.create({
                baseURL:`https://api.openweathermap.org/data/2.5/weather`,
                params:{
                    lat:lat,
                    lon:lon,
                    appid:process.env.wheaterKey,
                    units:'metric',
                    lang:'es'                }
            });

            const resp = await instance.get();
            const {weather,main} = resp.data;

            return {
                desc:weather[0].description,
                min:main.temp_min,
                max:main.temp_max,
                temp:main.temp
            }
        }catch(error){

        }
    }

    agregarHistorial(lugar = ''){
        if(this.historial.includes(lugar.toLowerCase())){
            return;
        }
        this.historial = this.historial.splice(0,5);
        this.historial.unshift(lugar.toLowerCase());
        //Grabar en DB
        this.guardarDB();
    }

    guardarDB(){
        const payload = {
            historial: this.historial
        };
        
        fs.writeFileSync(this.dbPath,JSON.stringify(payload));
    }
    leerDB(){
        if(!fs.existsSync(this.dbPath)){
            return;
        }
        const info = fs.readFileSync(this.dbPath,{encoding:'utf-8'});
        const data = JSON.parse(info);

        this.historial = data.historial;
    }
}


module.exports = Busquedas;