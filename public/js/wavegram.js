/*
 * Wavegram prototype to plot.
 *
 */
function Wavegram(wData, container, container2) {
    this.waveHeight = [];
    this.waveDirection = [];
    this.maxWaveHeight = [];
    this.windSpeed = [];
    this.maxWindSpeed = [];
    this.windDirection = [];
    this.periodo = [];

    // Initialize
    this.waveData = wData;
    this.waveContainer = container;
    this.windContainer = container2;

    this.colors = [
        Highcharts.getOptions().colors[7],
        Highcharts.getOptions().colors[6]
    ];

    // Run
    this.parseWaveData();
}

function parse1Decimal (str) {
    var hilera = str.toString();
    var i=0;
    while( hilera[i]!='.' && i<hilera.length) {
        i++;
    }

    if(i+2<hilera.length) {
        hilera=hilera.substring(0,i+2);
    }

    return hilera;
}

function getPuntoCardinal (grados) {

    var resultado = "";
    if( 348.76 <= grados || grados <= 11.25 ) {
        resultado = "Norte";
    } else if( 11.26 <= grados && grados <= 33.75 ) {
        resultado = "Norte Noreste";
    } else if( 33.76 <= grados && grados <= 56.25 ) {
        resultado = "Noreste";
    } else if( 56.26 <= grados && grados <= 78.75 ) {
        resultado = "Este Noreste";
    } else if( 78.76 <= grados && grados <= 101.25 ) {
        resultado = "Este";
    } else if( 101.26 <= grados && grados <=  123.75) {
        resultado = "Este Sureste";
    } else if( 123.76 <= grados && grados <= 145.25 ) {
        resultado = "Sureste";
    } else if( 145.26 <= grados && grados <= 168.75 ) {
        resultado = "Sur Sureste";
    } else if( 168.76 <= grados && grados <= 191.25 ) {
        resultado = "Sur";
    } else if( 191.26 <= grados && grados <= 213.75 ) {
        resultado = "Sur Suroeste";
    } else if( 213.76 <= grados && grados <= 236.25 ) {
        resultado = "Suroeste";
    } else if( 236.26 <= grados && grados <= 258.75 ) {
        resultado = "Oeste Suroeste";
    } else if( 258.76 <= grados && grados <= 281.25 ) {
        resultado = "Oeste";
    } else if( 281.26 <= grados && grados <= 303.75 ) {
        resultado = "Oeste Noroeste";
    } else if( 303.76 <= grados && grados <= 326.25 ) {
        resultado = "Noroeste";
    } else if( 326.26 <= grados && grados <= 348.75 ) {
        resultado = "Norte Noroeste";
    }

    return resultado;
}

function getSimboloCardinal (grados) {

    var resultado = "";
    if( 348.76 <= grados || grados <= 11.25 ) {
        resultado = "N";
    } else if( 11.26 <= grados && grados <= 33.75 ) {
        resultado = "NNE";
    } else if( 33.76 <= grados && grados <= 56.25 ) {
        resultado = "NE";
    } else if( 56.26 <= grados && grados <= 78.75 ) {
        resultado = "ENE";
    } else if( 78.76 <= grados && grados <= 101.25 ) {
        resultado = "E";
    } else if( 101.26 <= grados && grados <=  123.75) {
        resultado = "ESE";
    } else if( 123.76 <= grados && grados <= 145.25 ) {
        resultado = "SE";
    } else if( 145.26 <= grados && grados <= 168.75 ) {
        resultado = "SSE";
    } else if( 168.76 <= grados && grados <= 191.25 ) {
        resultado = "S";
    } else if( 191.26 <= grados && grados <= 213.75 ) {
        resultado = "SSW";
    } else if( 213.76 <= grados && grados <= 236.25 ) {
        resultado = "SW";
    } else if( 236.26 <= grados && grados <= 258.75 ) {
        resultado = "WSW";
    } else if( 258.76 <= grados && grados <= 281.25 ) {
        resultado = "W";
    } else if( 281.26 <= grados && grados <= 303.75 ) {
        resultado = "WNW";
    } else if( 303.76 <= grados && grados <= 326.25 ) {
        resultado = "NW";
    } else if( 326.26 <= grados && grados <= 348.75 ) {
        resultado = "NNW";
    }

    return resultado;
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function getAllIndexes(arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}

function traducirDias(str) {

    var transDia = [["Monday","Lunes"],["Tuesday","Martes"],["Wednesday","Miércoles"],["Thursday","Jueves"],
                        ["Friday","Viernes"],["Saturday","Sábado"],["Sunday","Domingo"],["Mon","Lun"],
                        ["Tue","Mar"],["Wed","Miérc"],["Thu","Jue"],["Fri","Vie"],["Sat","Sáb"],["Sun","Dom"]];

    for(var i=0; i<transDia.length; i++) {
        str = replaceAll(transDia[i][0], transDia[i][1], str);
    }

    return str;
}

function traducirMeses(str) {
    var indices = getAllIndexes(str, " ");
    str = str.substring(indices[0], str.length) + str.substring(0, indices[0]);

    var transMes = [["Jan"," de enero"],["Feb"," de febrero"],["Mar"," de marzo"],["Apr"," de abril"], ["May"," de mayo"],
                ["Jun"," de junio"],["Jul"," de julio"],["Aug"," de agosto"],["Sep"," de septiembre"],
                ["Oct"," de octubre"],["Nov"," de noviembre"],["Dec"," de diciembre"]];


    for(var i=0; i<transMes.length; i++) {
        str = replaceAll(transMes[i][0], transMes[i][1], str);
    }

    return str;
}

function traducirFecha (fecha) {
    var indices = getAllIndexes(fecha, " ");
    var dia = fecha.substring(0, indices[0]+1);
    var mes = fecha.substring(indices[0]+1, indices[2]-1)
    var resto = fecha.substring(indices[2]-1, fecha.length);

    return traducirDias(dia) + traducirMeses(mes) + resto;
}

/**
 * Handle the data.
 */
Wavegram.prototype.parseWaveData = function () {

    var wgram = this,
        waveData = this.waveData,
        pointStart;

    if (!waveData) {
        $('#loading').html('<i class="fa fa-frown-o"></i> Failed loading data, please try again later');
        return;
    }

    // The returned xml variable is a JavaScript representation of the provided XML,
    // generated on the server by running PHP simple_load_xml and converting it to
    // JavaScript by json_encode.
    $.each(waveData.data, function (i, obj) {
        // Get the times - only Safari can't parse ISO8601 so we need to do some replacements

        var fecha=obj['Time'].split(" ")[0].split("-"),
            hora=obj['Time'].split(" ")[1].split(":")[0];

        var from = Date.parse( obj['Time'].replace(/-/g, "/") ) - (3 * 36e5),//Date.parse( new Date(fecha[0], fecha[1]-1, fecha[2], hora, 0, 0) ),
            to = from + (3 * 36e5);//Date.parse( new Date(fecha[0], fecha[1], fecha[2], hora, 0, 0) ) + (6 * 36e5);

        if (to > pointStart + (7 * 24 * 36e5) ) {
            return;
        }

        // Populate the parallel arrays
        var cNum = 
        wgram.waveHeight.push({
            x: from,
            y: parseFloat( obj['LatLon_14X16-11p0N-87p00W/sig_wav_ht_surface'] ) // Hsig
        });
        wgram.maxWaveHeight.push({
            x: from,
            y: parseFloat( obj['LatLon_14X16-11p0N-87p00W/max_wav_ht_surface'] ) // Hmax
        });

        //****************************MATH-ABS REVISAR****************************
        wgram.waveDirection.push( Math.abs( parseFloat( obj['LatLon_14X16-11p0N-87p00W/peak_wav_dir_surface'] ) - 180 ) ); // O_h
        //****************************MATH-ABS REVISAR****************************

        var u = parseFloat( obj['LatLon_27X31-10p25N-87p25W/wnd_ucmp_height_above_ground'] );
        var v = parseFloat( obj['LatLon_27X31-10p25N-87p25W/wnd_vcmp_height_above_ground'] );

        var rootTmp = Math.sqrt( Math.pow(u,2) + Math.pow(v,2) ) * 3.6;

        wgram.windSpeed.push({
            x: from,
            y: rootTmp
        });

        wgram.maxWindSpeed.push({
            x: from,
            y: rootTmp * 1.3
        });

        wgram.windDirection.push( Math.abs( Math.atan( u / v) - 90 ) );

        wgram.periodo.push( parseFloat( obj['LatLon_14X16-11p0N-87p00W/peak_wav_per_surface'] ) );

        if (i == 0) {
            pointStart = (from + to) / 2;
        }
    });

    // Create the chart when the data is loaded
    this.createWaveChart();
    this.createWindChart();
};

/**
 * Callback function that is called from Highcharts on hovering each point and returns
 * HTML for the tooltip.
 */
Wavegram.prototype.waveTooltipFormatter = function (tooltip) {

    var wgram = this;

    // Create the header with reference to the time interval
    var index = tooltip.points[0].point.index,
        ret = '<small>' + traducirFecha(Highcharts.dateFormat('%A, %b %e, %H:%M', (tooltip.x-(3*36e5)))) + ' - ' + Highcharts.dateFormat('%H:%M', (tooltip.x+(3*36e5))) + '</small><br>';

    // Symbol text
    //ret += '<b>' + this.symbolNames[index] + '</b>';

    ret += '<table>';

    var littleStr = "sig";
    littleStr = littleStr.fontsize(1);

    var hilera = "" + wgram.waveHeight[index].y;
    ret += '<tr><td><span style="color:' + wgram.colors[0] + '">\u25C6</span> ' + 'H' + littleStr +
            ': </td><td style="white-space:nowrap;">' + parse1Decimal(hilera) +
            'm' + '</td></tr>';

    littleStr = 'max';
    littleStr = littleStr.fontsize(1);

    hilera = "" + wgram.maxWaveHeight[index].y;
    ret += '<tr><td><span style="color:' + wgram.colors[0] + '">\u25CF</span> ' + 'H' + littleStr +
            ': </td><td style="white-space:nowrap;">' + parse1Decimal(hilera) +
            'm' + '</td></tr>';

    littleStr = 'H';
    littleStr = littleStr.fontsize(1);

    hilera = wgram.waveDirection[index];
    ret += '<tr><td><span style="color:#000">\u2190</span>' + 'O' + littleStr +
            ': </td><td style="white-space:nowrap;">' + parse1Decimal(hilera) +
            '\u00B0 (' + getSimboloCardinal(parse1Decimal(hilera)) + ')</td></tr>';

    littleStr = 'P';
    littleStr = littleStr.fontsize(1);

    hilera = "" + Math.floor(wgram.periodo[index]);
    ret += '<tr><td><span style="font-weight:bold">\u2015</span> ' + 'T' + littleStr +
            ': </td><td style="white-space:nowrap;">' + hilera + 's</td></tr>';

    // Close
    ret += '</table>';


    return "<div style='width: 175px; white-space:normal;'>" + ret + "</div>";
};

/**
 * Callback function that is called from Highcharts on hovering each point and returns
 * HTML for the tooltip.
 */
Wavegram.prototype.windTooltipFormatter = function (tooltip) {

    var wgram = this;

    // Create the header with reference to the time interval
    var index = tooltip.points[0].point.index,
        ret = '<small>' + traducirFecha(Highcharts.dateFormat('%A, %b %e, %H:%M', (tooltip.x-(3*36e5)))) + ' - ' + Highcharts.dateFormat('%H:%M', (tooltip.x+(3*36e5))) + '</small><br>';

    // Symbol text
    //ret += '<b>' + this.symbolNames[index] + '</b>';

    ret += '<table>';

    var hilera = "" + wgram.windSpeed[index].y;
    ret += '<tr><td><span style="color:' + wgram.colors[1] + '">\u25C6</span> ' + 'V' +
            ': </td><td style="white-space:nowrap;">' + parse1Decimal(hilera) +
            ' km/h' + '</td></tr>';

    hilera = "" + wgram.maxWindSpeed[index].y;
    ret += '<tr><td><span style="color:' + wgram.colors[1] + '">\u25CF</span> ' + 'Ráfaga' +
            ': </td><td style="white-space:nowrap;">' + parse1Decimal(hilera) +
            ' km/h' + '</td></tr>';

    var littleStr = "w";
    littleStr = littleStr.fontsize(1);

    hilera = "" + wgram.windDirection[index];
    ret += '<tr><td><span style="color:#000; font-size:16px;">\u2190</span> ' + 'O' + littleStr +
            ': </td><td style="white-space:nowrap;">' + parse1Decimal(hilera) +
            '\u00B0 (' + getSimboloCardinal(parse1Decimal(hilera)) + ')</td></tr>';
    // Close
    ret += '</table>';


    return "<div style='width: 175px; white-space:normal;'>" + ret + "</div>";
};

/**
 * Build and return the Highcharts options structure
 */
Wavegram.prototype.getWaveChartOptions = function () {
    var wavegram = this;

    return {
        chart: {
            renderTo: this.waveContainer,
            marginBottom: 90,
            marginRight: 50,
            paddingLeft: 20,
            marginTop: 50,
            plotBorderWidth: 1,
            width: 800,
            height: 300
        },

        title: {
            text: "",
            align: 'left'
        },

        tooltip: {
            shared: true,
            useHTML: true,
            style: {
                width: 100,
                fontFamily:'Helvetica, sans-serif'
            },
            formatter: function () {
                return wavegram.waveTooltipFormatter(this);
            }
        },

        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            style: {
                fontFamily:'Helvetica, sans-serif'   
            },
            x: -40,
            y: 40
        },

        xAxis: [{ // Bottom X axis
            type: 'datetime',
            tickInterval: 6 * 36e5, // two hours
            //minorTickInterval: 3 * 36e5, // one hour
            tickLength: 0,
            gridLineWidth: 1,
            gridLineColor: (Highcharts.theme && Highcharts.theme.background2) || '#F0F0F0',
            startOnTick: true,
            endOnTick: false,
            minPadding: 0.015,
            maxPadding: 0.015,
            offset: 44,
            showLastLabel: false,
            showFirstLabel: true,
            labels: {
                format: '{value:<span style="font-size:8px;font-family:Helvetica, sans-serif;">%H:00</span>}'
            }
        }, { // Top X axis
            linkedTo: 0,
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            labels: {
                format: '{value:<span style="font-size: 12px; font-weight: 600;font-family:Helvetica, sans-serif">%e/%m/%Y</span>}',//'{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
                align: 'left',
                x: 3,
                y: -5
            },
            opposite: true,
            tickLength: 20,
            gridLineWidth: 1,
            showLastLabel: false,
            showFirstLabel: true
        }],

        yAxis: [{ // Wave Height axis
            title: {
                text: "Altura de ola (m)",
                style: {
                    fontSize: '12px',
                    fontFamily:'Helvetica, sans-serif',
                    color: wavegram.colors[0]
                },
            },
            labels: {
                format: '{value}',
                style: {
                    fontSize: '10px',
                    fontFamily:'Helvetica, sans-serif',
                    color: wavegram.colors[0]
                },
                x: -3
            },
            plotLines: [{ // zero plane
                value: 0,
                color: '#BBBBBB',
                width: 1,
                zIndex: 2
            }],

            maxPadding: 0.3,
            tickInterval: 1,
            gridLineWidth: 0,
            gridLineColor: (Highcharts.theme && Highcharts.theme.background2) || '#F0F0F0'

        }],

        plotOptions: {
            series: {
                pointPlacement: 0.5
            }
        },

        series: [{
            name: 'Altura máxima',
            data: this.maxWaveHeight,
            type: 'spline',
            dashStyle: 'shortdot',
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            },
            tooltip: {
                valueSuffix: 'm'
            },
            zIndex: 1,
            color: wavegram.colors[0],
            yAxis: 0
        }, {
            name: 'Altura significativa',
            data: this.waveHeight,
            type: 'spline',
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            },
            tooltip: {
                valueSuffix: 'm'
            },
            zIndex: 1,
            color: wavegram.colors[0],
            negativeColor: '#48AFE8',
            yAxis: 0
        }]
    }
};

/**
 * Build and return the Highcharts options structure
 */
Wavegram.prototype.getWindChartOptions = function () {
    var wavegram = this;

    return {
        chart: {
            renderTo: this.windContainer,
            marginBottom: 80,
            marginRight: 50,
            marginTop: 50,
            plotBorderWidth: 1,
            width: 800,
            height: 300
        },

        title: {
            text: "",
            align: 'left'
        },

        tooltip: {
            shared: true,
            useHTML: true,
            style: {
                width: 100,
                fontFamily:'Helvetica, sans-serif'
            },
            formatter: function () {
                return wavegram.windTooltipFormatter(this);
            }
        },

        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            style: {
                fontFamily:'Helvetica, sans-serif'   
            },
            x: -40,
            y: 40
        },

        xAxis: [{ // Bottom X axis
            type: 'datetime',
            tickInterval: 6 * 36e5, // two hours
            //minorTickInterval: 3 * 36e5, // one hour
            tickLength: 0,
            gridLineWidth: 1,
            gridLineColor: (Highcharts.theme && Highcharts.theme.background2) || '#F0F0F0',
            startOnTick: true,
            endOnTick: false,
            minPadding: 0.015,
            maxPadding: 0.015,
            offset: 31,
            showLastLabel: false,
            showFirstLabel: true,
            labels: {
                format: '{value:<span style="font-size:8px;font-family:Helvetica, sans-serif;">%H:00</span>}'
            }
        }, { // Top X axis
            linkedTo: 0,
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            labels: {
                format: '{value:<span style="font-size: 12px; font-weight: 600;font-family:Helvetica, sans-serif;">%e/%m/%Y</span>}',//'{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
                align: 'left',
                x: 3,
                y: -5
            },
            opposite: true,
            tickLength: 20,
            gridLineWidth: 1,
            showLastLabel: false,
            showFirstLabel: true
        }],

        yAxis: [{ // Wave Height axis
            title: {
                text: "Velocidad de viento (km/h)",
                style: {
                    fontSize: '12px',
                    fontFamily:'Helvetica, sans-serif',
                    color: wavegram.colors[1]
                }
            },
            labels: {
                format: '{value}',
                style: {
                    fontSize: '10px',
                    fontFamily:'Helvetica, sans-serif',
                    color: wavegram.colors[1]
                },
                x: -3
            },
            plotLines: [{ // zero plane
                value: 0,
                color: '#BBBBBB',
                width: 1,
                zIndex: 2
            }],
            maxPadding: 0.3,
            gridLineWidth: 0,
            //tickInterval: 100,
            //minorTickInterval: 0,
            gridLineColor: (Highcharts.theme && Highcharts.theme.background2) || '#F0F0F0'

        }],


        series: [{
            name: 'Ráfaga',
            color: wavegram.colors[1],
            data: this.maxWindSpeed,
            type: 'spline',
            dashStyle: 'shortdot',
            marker: {
                enabled: false
            },
            shadow: false,
            tooltip: {
                valueSuffix: 'km/h'
            },
            //dashStyle: 'shortdot',
            yAxis: 0
        }, {
            name: 'Viento promedio',
            color: wavegram.colors[1],
            data: this.windSpeed,
            type: 'spline',
            marker: {
                enabled: false
            },
            shadow: false,
            tooltip: {
                valueSuffix: 'km/h'
            },
            //dashStyle: 'shortdot',
            yAxis: 0
        }]
    }
};

/**
 * Post-process the chart from the callback function, the second argument to Highcharts.Chart.
 */
Wavegram.prototype.onWaveChartLoad = function (chart) {
    //this.drawWeatherSymbols(chart);
    this.drawArrows(chart, true);
    this.drawBlocksForWindArrows(chart, true);

    //Pintar la definición en el gráfico del periodo
    chart.renderer.text(
            "\u2015",
            22,
            255
        ).attr({
            zIndex: 5
        }).css({
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 18,
            fontWeight: 900
        }).add();
    chart.renderer.text(
            "periodo",
            8,
            261
        ).attr({
            zIndex: 5
        }).css({
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 9,
            fontWeight: 400
        }).add();
        chart.renderer.image('/img/wavegram_side_img.png',750,49,39,206).add();
};

/**
 * Post-process the chart from the callback function, the second argument to Highcharts.Chart.
 */
Wavegram.prototype.onWindChartLoad = function (chart) {
    //this.drawWeatherSymbols(chart);
    this.drawArrows(chart, false);
    this.drawBlocksForWindArrows(chart, false);
    chart.renderer.image('/img/wavegram_side_img.png',750,49,39,206).add();
};

/**
 * Create the chart. This function is called async when the data file is loaded and parsed.
 */
Wavegram.prototype.createWaveChart = function () {
    var wavegram = this;
    this.chart = new Highcharts.Chart(this.getWaveChartOptions(), function (chart) {
        wavegram.onWaveChartLoad(chart);
    });
};

/**
 * Create the chart. This function is called async when the data file is loaded and parsed.
 */
Wavegram.prototype.createWindChart = function () {
    var wavegram = this;
    this.chart = new Highcharts.Chart(this.getWindChartOptions(), function (chart) {
        wavegram.onWindChartLoad(chart);
    });
};

/**
 * Create wind speed symbols for the Beaufort wind scale. The symbols are rotated
 * around the zero centerpoint.
 */
Wavegram.prototype.windArrow = function (conPalitos) {
    var level,
        path;

    // The stem and the arrow head
    path = [
        'M', 0, 7, // base of arrow
        'L', -1.5, 7,
        0, 10,
        1.5, 7,
        0, 7,
        0, -10 // top
    ];

    return path;
};

/**
 * Draw the wind arrows. Each arrow path is generated by the windArrow function above.
 */
Wavegram.prototype.drawArrows = function (chart, esWave) {
    var wavegram = this;

    $.each(chart.series[0].data, function (i, point) {
        var sprite, arrow, x, y;

        // Draw the wind arrows
        x = point.plotX + chart.plotLeft;//+15.5;
        y = 232 - ((esWave)?10:0);

        arrow = chart.renderer.path(
                wavegram.windArrow(false)
            ).attr({
                rotation: 180+parseInt((esWave)?wavegram.waveDirection[i]:wavegram.windDirection[i], 10),
                translateX: x, // rotation center
                translateY: y, // rotation center
                resize: 2.8
            });

        //simbolo dirercción viento/ola
        var hilera = getSimboloCardinal((esWave)?wavegram.waveDirection[i]:wavegram.windDirection[i]);
        var offset = 5;
        if (hilera.length==2) {
            offset = 8.5;
        } else if(hilera.length==3) {
            offset = 12;
        }

        chart.renderer.text(
                hilera,
                x - offset,
                y+18
            ).attr({
                zIndex: 5
            }).css({
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: 12,
                fontWeight: 500
            }).add();

        //periodo
        if(esWave) {
            hilera = Math.floor( wavegram.periodo[i] );
            chart.renderer.text(
                    hilera,
                    x - 6,
                    y+30
                ).attr({
                    zIndex: 5
                }).css({
                    fontFamily: '"Courier New", Courier, monospace',
                    fontSize: 8,
                    fontWeight: 900
                }).add();
        }

        arrow.attr({
                stroke: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
                'stroke-width': 1.5,
                zIndex: 5
            })
            .add();
    });
};

/**
 * Draw blocks around wind arrows, below the plot area
 */
Wavegram.prototype.drawBlocksForWindArrows = function (chart, esWave) {
    var xAxis = chart.xAxis[0],
        x,
        pos,
        max,
        isLong,
        isLast,
        i;

    for (pos = xAxis.min, max = xAxis.max, i = 0; pos <= max + 36e5; pos += 6*36e5, i += 1) {

        // Get the X position
        isLast = pos === max + 36e5;
        x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5)//+20;

        // Draw the vertical dividers and ticks
        if (this.resolution > 36e5) {
            isLong = pos % this.resolution === 0;
        } else {
            isLong = i % 2 === 0;
        }
        isLong=true;
        chart.renderer.path(['M', x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
            'L', x, chart.plotTop + chart.plotHeight + ((esWave)?45:32), 'Z'])
            .attr({
                'stroke': chart.options.chart.plotBorderColor,
                'stroke-width': 1
            })
            .add();
    }
};


// Dummy object so we can reuse our canvas-tools.js without errors
Highcharts.CanVGRenderer = {};

/**
 * Add a new method to the Chart object to invoice a local download
 */
Highcharts.Chart.prototype.exportChartLocal = function (options) {

    var chart = this,
        svg = this.getSVG(), // Get the SVG
        canvas,
        a,
        href,
        extension,
        download = function () {

            var blob;

            // IE specific
            if (navigator.msSaveOrOpenBlob) { 

                // Get PNG blob
                if (extension === 'png') {
                    blob = canvas.msToBlob();

                // Get SVG blob
                } else {
                    blob = new MSBlobBuilder;
                    blob.append(svg);
                    blob = blob.getBlob('image/svg+xml');
                }

                navigator.msSaveOrOpenBlob(blob, 'chart.' + extension);

            // HTML5 download attribute
            } else {
                a = document.createElement('a');
                a.href = href;
                a.download = 'chart.' + extension;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        },
        prepareCanvas = function () {
            canvas = document.createElement('canvas'); // Create an empty canvas
            window.canvg(canvas, svg); // Render the SVG on the canvas

            href = canvas.toDataURL('image/png');
            extension = 'png';
        };

    // Add an anchor and apply the download to the button
    if (options && options.type === 'image/svg+xml') {
        href = 'data:' + options.type + ',' + svg;
        extension = 'svg';
        download();

    } else {

        // It's included in the page or preloaded, go ahead
        if (window.canvg) {
            prepareCanvas();
            download();

        // We need to load canvg before continuing
        } else {
            this.showLoading();
            getScript(Highcharts.getOptions().global.canvasToolsURL, function () {
                chart.hideLoading();
                prepareCanvas();
                download();
            });
        }
    }
};


// Extend the default options to use the local exporter logic
Highcharts.getOptions().exporting.buttons.contextButton.menuItems = [{
    textKey: 'printChart',
    onclick: function () {
        this.print();
    }
}, {
    separator: true
}, {
    textKey: 'downloadPNG',
    onclick: function () {
        this.exportChartLocal();
    }
}, {
    textKey: 'downloadSVG',
    onclick: function () {
        this.exportChartLocal({
            type: 'image/svg+xml'
        });
    }
}];

/**
* Downloads a script and executes a callback when done.
* @param {String} scriptLocation
* @param {Function} callback
*/
function getScript(scriptLocation, callback) {
    var head = document.getElementsByTagName('head')[0],
        script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = scriptLocation;
    script.onload = callback;

    head.appendChild(script);
}

/**
* Initializes Highchart
*/

function initializeWavegram(fileURL){
    $.get(
        fileURL,
        function (wData) {
            var data = Papa.parse(wData, { header: true, skipEmptyLines: true });
            var wavegram = new Wavegram(data, 'container', 'container2');
        }
    );
}

/**
 * jQuery - On DOM Ready.
 */
$(function() {

    var archivos = ['bahia-salinas', 'I-coco', 'limon', 'P-sur',
                    'puntarenas', 'quepos', 'samara', 'tamarindo'];

    $.get(
        './datos-csv/' + archivos[2] + '.csv',
        function (wData) {
            var data = Papa.parse(wData, { header: true, skipEmptyLines: true });
            var wavegram = new Wavegram(data, 'container', 'container2');
        }
    );
});