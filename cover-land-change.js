var dataset = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2") 
    .filterDate('2022-01-01', '2022-10-01');
    
var visualization = {
  bands: ['SR_B4', 'SR_B3', 'SR_B2']
  
};

Map.setCenter(-73.03772407299923, 7.056060322709396, 12);

Map.addLayer(dataset, visualization, 'True Color (432)');