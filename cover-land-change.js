//------------------------------LÍMITES DTAN---------------------------------------------------------//
//Límites de cada AP de la DTAN

var Limite = ee.FeatureCollection(table);


//Centrar capa (El valor 9 hace referencia al zoom)
Map.centerObject(Limite,9);
var Landsat_8_t0  = ee.ImageCollection ("LC8_L1T"); //Disponibilidad, entre 2013-presente

var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterDate('2022-08-01', '2022-08-30')
    .filterBounds(table);

// Applies scaling factors.
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

dataset = dataset.map(applyScaleFactors);

var visualization = {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  min: 0.0,
  max: 0.3,
};

Map.setCenter(-73, 7, 8);

Map.addLayer(dataset, visualization, 'True Color (432)');



/*

//------------------COLECCIÓN DE DATOS----------------------//
var Landsat_8_t0  = ee.ImageCollection ("LC8_L1T"); //Disponibilidad, entre 2013-presente
var Landsat_8_t1  = ee.ImageCollection ("LC8_L1T"); //Disponibilidad, entre 2013-presente

//Filtrar la collecció. Primero por fecha, segundo por el límite de estudio y tercero por porncentaje de nubosidad
var Filtro_L8t0 = Landsat_8_t0.filterDate    ('2022-09-01', '2022-09-30')
                         .filterBounds  (Limite)
                         .filterMetadata('CLOUD_COVER', 'less_than', 50);
var Filtro_L8t1 = Landsat_8_t1.filterDate    ('2022-09-30', '2022-10-29')
                         .filterBounds  (Limite)
                         .filterMetadata('CLOUD_COVER', 'less_than', 50);

/*Aplicación de algoritmo para construcción de mosaicos 
eligiendo los pixeles con valores concentrados al percentil 50,
con un porcentaje de nubosidad del pixel de 10 y que elija 50 imagenes para construirlo 
var mt0_L8 = ee.Algorithms.Landsat.simpleComposite(Filtro_L8t0, 50, 10, 50);  
var mt1_L8 = ee.Algorithms.Landsat.simpleComposite(Filtro_L8t1, 50, 10, 50);

//Cortar los mosaicos con el límite del área de estudio
var corte_mosaicot0 = mt0_L8.clip(Limite);
var corte_mosaicot1 = mt1_L8.clip(Limite);

//Nombrar las bandas de los sensores para luego renombrarlas en cada uno de ellos
var nombres_bandas = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7' ];

//Función para luego aplicarla a cada uno de los mosaicos de acuerdo al sensor con el que se construyó
var L8t0 = function(image) {return image.select(['B2','B3','B4', 'B5', 'B6', 'B7','B8' ], nombres_bandas)};
var L8t1 = function(image) {return image.select(['B2','B3','B4', 'B5', 'B6', 'B7','B8' ], nombres_bandas)};

/*Aplicación de funciones para normalizar los nombres de las bandas,
es decir, selecciona las que debe y les reasigna nombres iguales para las 2 colecciones
var Mosaico_1 = L8t0(corte_mosaicot0);
var Mosaico_2 = L8t1(corte_mosaicot1);

/*Relacciones de bandas para construir nuevas bandas con algunas normalizaiones que
permiten resultados más precisos en las clasificaciones
var rat45_t0 = Mosaico_1.select("B4").divide(Mosaico_1.select("B5"));
var rat46_t0 = Mosaico_1.select("B4").divide(Mosaico_1.select("B6"));
var rat47_t0 = Mosaico_1.select("B4").divide(Mosaico_1.select("B7"));
var rat56_t0 = Mosaico_1.select("B5").divide(Mosaico_1.select("B6"));
var rat57_t0 = Mosaico_1.select("B5").divide(Mosaico_1.select("B7"));
var rat67_t0 = Mosaico_1.select("B6").divide(Mosaico_1.select("B7"));

var rat45_t1 = Mosaico_2.select("B4").divide(Mosaico_2.select("B5"));
var rat46_t1 = Mosaico_2.select("B4").divide(Mosaico_2.select("B6"));
var rat47_t1 = Mosaico_2.select("B4").divide(Mosaico_2.select("B7"));
var rat56_t1 = Mosaico_2.select("B5").divide(Mosaico_2.select("B6"));
var rat57_t1 = Mosaico_2.select("B5").divide(Mosaico_2.select("B7"));
var rat67_t1 = Mosaico_2.select("B6").divide(Mosaico_2.select("B7"));

//Construcción de pilas de capas con multiples bandas entre originales y bandas relacionadas
var m_1_RB = Mosaico_1  .addBands(rat45_t0).addBands(rat46_t0).addBands(rat47_t0)
                        .addBands(rat56_t0).addBands(rat57_t0).addBands(rat67_t0);
var m_2_RB = Mosaico_2  .addBands(rat45_t1).addBands(rat46_t1).addBands(rat47_t1)
                        .addBands(rat56_t1).addBands(rat57_t1).addBands(rat67_t1);

//Construcción de mosaico multifechas (del Mosaico 1 y Mosaico 2)
var m_multifecha = m_1_RB.addBands(m_2_RB);

//PASOS PARA LA CLASIFICACIÓN
// 1. nombramiento y separación de bandas del mosaico multifechas
var bands= m_multifecha.bandNames();
//2. unir las muestras
var Muestras = Bosque_estable.merge(No_Bosque_estable).merge(Perdida).merge(Agua);

//3.Superponer los puntos de muestras en el mosaico multifecga para hacer el entrenamiento.
var Entrenamiento = m_multifecha.sampleRegions({
  collection: Muestras,
  properties: ['clase'],
  scale: 500
});
//4. Entrenar a un clasificador Random Forest con parámetros predeterminados.
var Entrenando = ee.Classifier.randomForest().train(Entrenamiento, 'clase', bands);

//5. Clasifica el mosaico multifecha con las mismas bandas utilizadas para el entrenamiento.
var clasificacion = m_multifecha.select(bands).classify(Entrenando);


//Visualización de capas//
Map.addLayer(Mosaico_1,{'bands': ['B4', 'B5', 'B3'], 'min': 0, 'max': 150},'Mosaico_T1',false);
Map.addLayer(Mosaico_2,{'bands': ['B4', 'B5', 'B3'], 'min': 0, 'max': 150},'Mosaico_T2',false);//estás bandas estan normalizadas vista infrarojo

//Map.addLayer(clasificacion,  {palette:'0e7a17,fff845,1f2cff', 'min':1, 'max':3},'Clasificación_CART');
Map.addLayer(clasificacion, {palette:'green,yellow,red,blue', 'min':1, 'max':4},'Clasificación_RandmForest');


//Descargar Mosaicos//
/*Se debe tener en cuenta que al momento de descargar una capa, se debe procurar que la clasificación
se muestre complentamente en el visor de mapa
Export.image.toDrive
({image: clasificacion,
 description: 'clasificacion',
 fileNamePrefix: 'Deforestacion',
 scale:30,
 maxPixels: 1e12,});

*/

