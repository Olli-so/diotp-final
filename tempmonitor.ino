#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include "creds.h"

#define DHTPIN 12          
#define DHTTYPE DHT22      

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(SSID, PASSWORD);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected");
}

void loop() {
  delay(2000);
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Reading sensor values failed");
    return;
  } 
  /*
  Serial.print("Temp: ");
  Serial.print(temperature);
  Serial.print(" °C\tHum: ");
  Serial.print(humidity);
  Serial.println(" %"); 
  */

  String queryURL = String(APIURL) + "?temp=" + String(temperature) + "&humid=" + String(humidity);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(queryURL);
    int httpResponseCode = http.GET();
    http.end();
  } else {
    Serial.println("Error: Not connected to WiFi");
  }
}
