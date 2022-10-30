//------------------------------LÍMITES DTAN---------------------------------------------------------//
//Límites de cada AP de la DTAN

var Limite = ee.FeatureCollection(table);


//Centrar capa (El valor 9 hace referencia al zoom)
Map.centerObject(Limite,9);


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
con un porcentaje de nubosidad del pixel de 10 y que elija 50 imagenes para construirlo */
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
es decir, selecciona las que debe y les reasigna nombres iguales para las 2 colecciones*/
var Mosaico_1 = L8t0(corte_mosaicot0);
var Mosaico_2 = L8t1(corte_mosaicot1);