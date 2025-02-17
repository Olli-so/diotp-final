import express from "express";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { getEnvs } from "./envs.mjs";
const ENV = getEnvs();
const app = express();

const DB_CLIENT = new InfluxDB({
    url: ENV.INFLUX.HOST,
    token: ENV.INFLUX.TOKEN
});

const DB_WRITE_POINT = DB_CLIENT.getWriteApi(
    ENV.INFLUX.ORG, 
    ENV.INFLUX.BUCKET
);
DB_WRITE_POINT.useDefaultTags({app: "temp_monitor"});

//Endpoint - base -> WIP site to display data
app.get("/", (_, res) => res.send("ok"));

//Endpoint - write data to influx. url = ip/data?temp=23&humid=55
app.get('/data', async (req, res) => {
    try {
        const temperature = req.query.temp;
        const humidity = req.query.humid;
        const temperatureFloat = parseFloat(temperature);
        const humidityFloat = parseFloat(humidity);
        const point = new Point("Thermohygrometer");
        point.tag("Location", "Outside");
        point.floatField("Temperature", temperatureFloat);
        point.floatField("Humidity", humidityFloat);
        DB_WRITE_POINT.writePoint(point); 
        await DB_WRITE_POINT.flush();
        res.send(`Values: ${temperature}, ${humidity} written`)
    } catch(err) {
        console.error(err);
        res.sendStatus(500);
    }
});

//Endpoint - for testing query parameters
app.get("/test", (req,res) => {
    console.log(req.query);
    res.send("Received queryparams!");
});

app.listen(ENV.PORT, ENV.HOST, () => {
    console.log(`Listening http://${ENV.HOST}:${ENV.PORT}`)
});
