/*
 * Wavegram prototype to plot.
 *
 */
function Wavegram(wData, container) {
	this.waveHeight = [];
    this.waveDirection = [];
    this.maxWaveHeight = [];
    this.windSpeed = [];
    this.windDirection = [];

    // Initialize
    this.waveData = wData;
    this.container = container;

    this.colors = [
        Highcharts.getOptions().colors[0],
        Highcharts.getOptions().colors[6]
    ];

    // Run
    this.parseWaveData();
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
    $.each(waveData, function (i, obj) {
        // Get the times - only Safari can't parse ISO8601 so we need to do some replacements

        var fecha=obj['Time'].split(" ")[0].split("-"),
            hora=obj['Time'].split(" ")[1].split(":")[0];

        var from = Date.parse( obj['Time'].replace(/-/g, "/") ),//Date.parse( new Date(fecha[0], fecha[1]-1, fecha[2], hora, 0, 0) ),
            to = from + (6 * 36e5);//Date.parse( new Date(fecha[0], fecha[1], fecha[2], hora, 0, 0) ) + (6 * 36e5);

        if (to > pointStart + 4 * 24 * 36e5) {
            return;
        }

        // If it is more than an hour between points, show all symbols
        /*if (i === 0) {
            wgram.resolution = to - from;
        }*/

        // Populate the parallel arrays
        wgram.waveHeight.push({
            x: from,
            y: obj['Significant_height_of_combined_wind_waves_and_swell_surface'],
            //to: to,
            //index: i
        });
        /*if (i==0) {
            console.log( new Date(from).toString() );
            var date = new Date(fecha[0], fecha[1], fecha[2], hora, 0, 0);
            console.log("KK:");
            console.log("Original: " + obj['Time'] );
            console.log("1) " + Date.parse(obj['Time']));
            console.log("2) " + from);

            console.log("KK2:");
            console.log("Response 1: " + new Date( Date.parse(obj['Time']) ) );
            console.log("Response 2: " + new Date( from ) );
        }*/
        wgram.maxWaveHeight.push({
            x: from,
            y: (parseFloat( wgram.waveHeight[i]['y'] ) * 1.3),
        });

        var tmp = obj['Primary_wave_direction_surface'];
        wgram.waveDirection.push( tmp.substring(1,tmp.length-1) );

        wgram.windSpeed.push({
            x: from,
            y: obj['Wind_speed_surface'],
        });

        tmp = obj['Wind_direction_from_which_blowing_surface'];
        wgram.windDirection.push( tmp.substring(1,tmp.length-1) );

        if (i == 0) {
            pointStart = (from + to) / 2;
        }
    });

	//console.log("kkkk: " + wgram.waveHeight);
    // Create the chart when the data is loaded
    this.createChart();
};

/**
 * Callback function that is called from Highcharts on hovering each point and returns
 * HTML for the tooltip.
 */
Wavegram.prototype.tooltipFormatter = function (tooltip) {

    // Create the header with reference to the time interval
    var index = tooltip.points[0].point.index,
        ret = '<small>' + Highcharts.dateFormat('%A, %b %e, %H:%M', tooltip.x) + '</small><br>';

    // Symbol text
    //ret += '<b>' + this.symbolNames[index] + '</b>';

    ret += '<table>';

    // Add all series
    Highcharts.each(tooltip.points, function (point) {
        var series = point.series;
        var hilera = Highcharts.pick(point.point.value, point.y) + "";
        ret += '<tr><td><span style="color:' + series.color + '">\u25CF</span> ' + series.name +
            ': </td><td style="white-space:nowrap;">' + hilera.substring(0,(hilera.length>4)?4:hilera.length) +
            series.options.tooltip.valueSuffix + '</td></tr>';
    });

    // Close
    ret += '</table>';


    return "<div style='width: 220px; white-space:normal;'>" + ret + "</div>";
};

/**
 * Build and return the Highcharts options structure
 */
Wavegram.prototype.getChartOptions = function () {
    var wavegram = this;

    return {
        chart: {
            renderTo: this.container,
            marginBottom: 70,
            marginRight: 40,
            marginTop: 50,
            plotBorderWidth: 1,
            width: 800,
            height: 310
        },

        title: {
            text: "Wavegram",//this.getTitle(),
            align: 'left'
        },

        credits: {
            text: 'Forecast from <a href="http://yr.no">yr.no</a>',
            href: "google.com",//this.xml.credit.link['@attributes'].url,
            position: {
                x: -40
            }
        },

        tooltip: {
            shared: true,
            useHTML: true,
            style: {
                width: 100
            },
            formatter: function () {
                return wavegram.tooltipFormatter(this);
            }
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
            minPadding: 0.035,
            maxPadding: 0.035,
            offset: 30,
            showLastLabel: true,
            showFirstLabel: false,
            labels: {
                format: '{value:<span style="font-size:8px">%H:00</span>}'
            }
        }, { // Top X axis
            linkedTo: 0,
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            labels: {
                format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
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
                text: "Wave Height",
                style: {
                    fontSize: '12px',
                    color: wavegram.colors[0]
                },
            },
            labels: {
                format: '{value}m',
                style: {
                    fontSize: '10px',
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
            gridLineColor: (Highcharts.theme && Highcharts.theme.background2) || '#F0F0F0'

        }, { // Wind Speed y1
            allowDecimals: false,
            title: { // Title on top of axis
                text: "Wind Speed (Knots)",
                //offset: 0,
                //align: 'high',
                //rotation: 0,
                style: {
                    fontSize: '10px',
                    color: wavegram.colors[1]
                },
                //textAlign: 'left',
                x: 3
            },
            labels: {
                style: {
                    fontSize: '8px',
                    color: wavegram.colors[1]
                },
                y: 2,
                x: 3
            },
            gridLineWidth: 0,
            opposite: true,
        }],

        legend: {
            enabled: false
        },


        series: [{
            name: 'Wind Speed',
            color: wavegram.colors[1],
            data: this.windSpeed,
            marker: {
                enabled: false
            },
            shadow: false,
            tooltip: {
                valueSuffix: 'kt'
            },
            //dashStyle: 'shortdot',
            yAxis: 1
        }, {
            name: 'Max Wave Height',
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
            name: 'Wave Height',
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
 * Post-process the chart from the callback function, the second argument to Highcharts.Chart.
 */
Wavegram.prototype.onChartLoad = function (chart) {
    //this.drawWeatherSymbols(chart);
    this.drawWindArrows(chart);
    this.drawBlocksForWindArrows(chart);
};

/**
 * Create the chart. This function is called async when the data file is loaded and parsed.
 */
Wavegram.prototype.createChart = function () {
    var wavegram = this;
    this.chart = new Highcharts.Chart(this.getChartOptions(), function (chart) {
        wavegram.onChartLoad(chart);
    });
};

/**
 * Create wind speed symbols for the Beaufort wind scale. The symbols are rotated
 * around the zero centerpoint.
 */
Wavegram.prototype.windArrow = function () {
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
Wavegram.prototype.drawWindArrows = function (chart) {
    var wavegram = this;

    $.each(chart.series[0].data, function (i, point) {
        var sprite, arrow, x, y;

        // Draw the wind arrows
        x = point.plotX + chart.plotLeft;
        y = 255;
        arrow = chart.renderer.path(
                wavegram.windArrow()
            ).attr({
                rotation: parseInt(wavegram.waveDirection[i], 10),
                translateX: x, // rotation center
                translateY: y // rotation center
            });

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
Wavegram.prototype.drawBlocksForWindArrows = function (chart) {
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
        x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5)+20;

        // Draw the vertical dividers and ticks
        if (this.resolution > 36e5) {
            isLong = pos % this.resolution === 0;
        } else {
            isLong = i % 2 === 0;
        }
        isLong=true;
        chart.renderer.path(['M', x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
            'L', x, chart.plotTop + chart.plotHeight + 32, 'Z'])
            .attr({
                'stroke': chart.options.chart.plotBorderColor,
                'stroke-width': 1
            })
            .add();
    }
};

/**
 * Get the title based on the XML data
 */
Wavegram.prototype.getTitle = function () {
    return 'Meteogram for ' + this.xml.location.name + ', ' + this.xml.location.country;
};

/**
 * jQuery - On DOM Ready.
 */
$(function() {
	var wData = [
      {
        "Time":"2015-01-06 00:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.949675440788269,
        "Primary_wave_direction_surface":"(36.32351303100586)",
        "Primary_wave_mean_period_surface":5.887963771820068,
        "Wind_direction_from_which_blowing_surface":"(59.603302001953125)",
        "Wind_speed_surface":13.275216102600098,
        "Primary_wave_direction_surface":"(36.32351303100586)",
        "Primary_wave_mean_period_surface":5.887963771820068,
        "Wind_direction_from_which_blowing_surface":"(59.603302001953125)",
        "Wind_speed_surface":13.275216102600098,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":14.215051651000977,
        "Mean_period_of_wind_waves_surface":5.880692958831787,
        "Direction_of_wind_waves_surface":"(47.61655044555664)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(183.405517578125)"
      },
      {
        "Time":"2015-01-06 06:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.879843831062317,
        "Primary_wave_direction_surface":"(54.155311584472656)",
        "Primary_wave_mean_period_surface":5.821532726287842,
        "Wind_direction_from_which_blowing_surface":"(57.719234466552734)",
        "Wind_speed_surface":12.819165229797363,
        "Primary_wave_direction_surface":"(54.155311584472656)",
        "Primary_wave_mean_period_surface":5.821532726287842,
        "Wind_direction_from_which_blowing_surface":"(57.719234466552734)",
        "Wind_speed_surface":12.819165229797363,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":17.771163940429688,
        "Mean_period_of_wind_waves_surface":5.807151794433594,
        "Direction_of_wind_waves_surface":"(48.4619026184082)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(217.82321166992188)"
      },
      {
        "Time":"2015-01-06 12:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.8281638622283936,
        "Primary_wave_direction_surface":"(41.70722961425781)",
        "Primary_wave_mean_period_surface":5.904750347137451,
        "Wind_direction_from_which_blowing_surface":"(54.57102584838867)",
        "Wind_speed_surface":12.171991348266602,
        "Primary_wave_direction_surface":"(41.70722961425781)",
        "Primary_wave_mean_period_surface":5.904750347137451,
        "Wind_direction_from_which_blowing_surface":"(54.57102584838867)",
        "Wind_speed_surface":12.171991348266602,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":13.507145881652832,
        "Mean_period_of_wind_waves_surface":5.89543342590332,
        "Direction_of_wind_waves_surface":"(48.331443786621094)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(193.441650390625)"
      },
      {
        "Time":"2015-01-06 18:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.7623745203018188,
        "Primary_wave_direction_surface":"(55.53065490722656)",
        "Primary_wave_mean_period_surface":5.7507524490356445,
        "Wind_direction_from_which_blowing_surface":"(56.63195037841797)",
        "Wind_speed_surface":12.427638053894043,
        "Primary_wave_direction_surface":"(55.53065490722656)",
        "Primary_wave_mean_period_surface":5.7507524490356445,
        "Wind_direction_from_which_blowing_surface":"(56.63195037841797)",
        "Wind_speed_surface":12.427638053894043,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":13.318144798278809,
        "Mean_period_of_wind_waves_surface":5.733805179595947,
        "Direction_of_wind_waves_surface":"(51.62815856933594)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(210.5162353515625)"
      },
      {
        "Time":"2015-01-07 00:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.8152984380722046,
        "Primary_wave_direction_surface":"(56.059181213378906)",
        "Primary_wave_mean_period_surface":5.794293403625488,
        "Wind_direction_from_which_blowing_surface":"(55.82149887084961)",
        "Wind_speed_surface":12.701908111572266,
        "Primary_wave_direction_surface":"(56.059181213378906)",
        "Primary_wave_mean_period_surface":5.794293403625488,
        "Wind_direction_from_which_blowing_surface":"(55.82149887084961)",
        "Wind_speed_surface":12.701908111572266,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":12.917137145996094,
        "Mean_period_of_wind_waves_surface":5.779912948608398,
        "Direction_of_wind_waves_surface":"(51.08615493774414)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(280.4726867675781)"
      },
      {
        "Time":"2015-01-07 06:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.8213149309158325,
        "Primary_wave_direction_surface":"(55.512420654296875)",
        "Primary_wave_mean_period_surface":5.787858486175537,
        "Wind_direction_from_which_blowing_surface":"(56.78865051269531)",
        "Wind_speed_surface":12.571985244750977,
        "Primary_wave_direction_surface":"(55.512420654296875)",
        "Primary_wave_mean_period_surface":5.787858486175537,
        "Wind_direction_from_which_blowing_surface":"(56.78865051269531)",
        "Wind_speed_surface":12.571985244750977,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":15.496099472045898,
        "Mean_period_of_wind_waves_surface":5.773639678955078,
        "Direction_of_wind_waves_surface":"(49.83283233642578)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(213.6605224609375)"
      },
      {
        "Time":"2015-01-07 12:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.7213345766067505,
        "Primary_wave_direction_surface":"(41.206172943115234)",
        "Primary_wave_mean_period_surface":5.855367660522461,
        "Wind_direction_from_which_blowing_surface":"(56.81953811645508)",
        "Wind_speed_surface":10.929912567138672,
        "Primary_wave_direction_surface":"(41.206172943115234)",
        "Primary_wave_mean_period_surface":5.855367660522461,
        "Wind_direction_from_which_blowing_surface":"(56.81953811645508)",
        "Wind_speed_surface":10.929912567138672,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":14.397624969482422,
        "Mean_period_of_wind_waves_surface":5.852639198303223,
        "Direction_of_wind_waves_surface":"(50.15467071533203)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(219.57533264160156)"
      },
      {
        "Time":"2015-01-07 18:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.527552843093872,
        "Primary_wave_direction_surface":"(51.56558609008789)",
        "Primary_wave_mean_period_surface":5.463709831237793,
        "Wind_direction_from_which_blowing_surface":"(49.75658416748047)",
        "Wind_speed_surface":10.831968307495117,
        "Primary_wave_direction_surface":"(51.56558609008789)",
        "Primary_wave_mean_period_surface":5.463709831237793,
        "Wind_direction_from_which_blowing_surface":"(49.75658416748047)",
        "Wind_speed_surface":10.831968307495117,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":7.640782833099365,
        "Mean_period_of_wind_waves_surface":5.440174579620361,
        "Direction_of_wind_waves_surface":"(47.21939468383789)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(188.734375)"
      },
      {
        "Time":"2015-01-08 00:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.598252296447754,
        "Primary_wave_direction_surface":"(168.34747314453125)",
        "Primary_wave_mean_period_surface":11.901554107666016,
        "Wind_direction_from_which_blowing_surface":"(53.54835510253906)",
        "Wind_speed_surface":11.099257469177246,
        "Primary_wave_direction_surface":"(168.34747314453125)",
        "Primary_wave_mean_period_surface":11.901554107666016,
        "Wind_direction_from_which_blowing_surface":"(53.54835510253906)",
        "Wind_speed_surface":11.099257469177246,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":9.690004348754883,
        "Mean_period_of_wind_waves_surface":5.552908420562744,
        "Direction_of_wind_waves_surface":"(46.06107711791992)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(190.67161560058594)"
      },
      {
        "Time":"2015-01-08 06:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.7116727828979492,
        "Primary_wave_direction_surface":"(48.480892181396484)",
        "Primary_wave_mean_period_surface":5.651795864105225,
        "Wind_direction_from_which_blowing_surface":"(54.65102767944336)",
        "Wind_speed_surface":11.735854148864746,
        "Primary_wave_direction_surface":"(48.480892181396484)",
        "Primary_wave_mean_period_surface":5.651795864105225,
        "Wind_direction_from_which_blowing_surface":"(54.65102767944336)",
        "Wind_speed_surface":11.735854148864746,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":14.275860786437988,
        "Mean_period_of_wind_waves_surface":5.65127420425415,
        "Direction_of_wind_waves_surface":"(44.47935485839844)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(214.7068634033203)"
      },
      {
        "Time":"2015-01-08 12:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.7879674434661865,
        "Primary_wave_direction_surface":"(33.3548583984375)",
        "Primary_wave_mean_period_surface":5.87545919418335,
        "Wind_direction_from_which_blowing_surface":"(53.593505859375)",
        "Wind_speed_surface":11.581235885620117,
        "Primary_wave_direction_surface":"(33.3548583984375)",
        "Primary_wave_mean_period_surface":5.87545919418335,
        "Wind_direction_from_which_blowing_surface":"(53.593505859375)",
        "Wind_speed_surface":11.581235885620117,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":13.649624824523926,
        "Mean_period_of_wind_waves_surface":5.872730255126953,
        "Direction_of_wind_waves_surface":"(43.836891174316406)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(189.904296875)"
      },
      {
        "Time":"2015-01-08 18:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.6192529201507568,
        "Primary_wave_direction_surface":"(50.68658447265625)",
        "Primary_wave_mean_period_surface":5.649240493774414,
        "Wind_direction_from_which_blowing_surface":"(55.7685661315918)",
        "Wind_speed_surface":10.925248146057129,
        "Primary_wave_direction_surface":"(50.68658447265625)",
        "Primary_wave_mean_period_surface":5.649240493774414,
        "Wind_direction_from_which_blowing_surface":"(55.7685661315918)",
        "Wind_speed_surface":10.925248146057129,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":13.463891983032227,
        "Mean_period_of_wind_waves_surface":5.639240264892578,
        "Direction_of_wind_waves_surface":"(45.71673583984375)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(214.70877075195312)"
      },
      {
        "Time":"2015-01-09 00:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.6964563131332397,
        "Primary_wave_direction_surface":"(50.80984878540039)",
        "Primary_wave_mean_period_surface":5.687061786651611,
        "Wind_direction_from_which_blowing_surface":"(56.13455581665039)",
        "Wind_speed_surface":11.39088249206543,
        "Primary_wave_direction_surface":"(50.80984878540039)",
        "Primary_wave_mean_period_surface":5.687061786651611,
        "Wind_direction_from_which_blowing_surface":"(56.13455581665039)",
        "Wind_speed_surface":11.39088249206543,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":9.625207901000977,
        "Mean_period_of_wind_waves_surface":5.6794304847717285,
        "Direction_of_wind_waves_surface":"(46.50484848022461)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(179.14598083496094)"
      },
      {
        "Time":"2015-01-09 06:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.6232335567474365,
        "Primary_wave_direction_surface":"(31.906763076782227)",
        "Primary_wave_mean_period_surface":5.855350494384766,
        "Wind_direction_from_which_blowing_surface":"(54.18671798706055)",
        "Wind_speed_surface":10.483020782470703,
        "Primary_wave_direction_surface":"(31.906763076782227)",
        "Primary_wave_mean_period_surface":5.855350494384766,
        "Wind_direction_from_which_blowing_surface":"(54.18671798706055)",
        "Wind_speed_surface":10.483020782470703,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":9.504908561706543,
        "Mean_period_of_wind_waves_surface":5.847557544708252,
        "Direction_of_wind_waves_surface":"(42.0902214050293)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(213.83604431152344)"
      },
      {
        "Time":"2015-01-09 12:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.6304153203964233,
        "Primary_wave_direction_surface":"(48.64000701904297)",
        "Primary_wave_mean_period_surface":5.764692306518555,
        "Wind_direction_from_which_blowing_surface":"(54.655513763427734)",
        "Wind_speed_surface":10.601347923278809,
        "Primary_wave_direction_surface":"(48.64000701904297)",
        "Primary_wave_mean_period_surface":5.764692306518555,
        "Wind_direction_from_which_blowing_surface":"(54.655513763427734)",
        "Wind_speed_surface":10.601347923278809,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":9.429642677307129,
        "Mean_period_of_wind_waves_surface":5.756899356842041,
        "Direction_of_wind_waves_surface":"(44.12189483642578)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(178.03823852539062)"
      },
      {
        "Time":"2015-01-09 18:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.4358688592910767,
        "Primary_wave_direction_surface":"(54.372894287109375)",
        "Primary_wave_mean_period_surface":5.3517913818359375,
        "Wind_direction_from_which_blowing_surface":"(64.79491424560547)",
        "Wind_speed_surface":10.016672134399414,
        "Primary_wave_direction_surface":"(54.372894287109375)",
        "Primary_wave_mean_period_surface":5.3517913818359375,
        "Wind_direction_from_which_blowing_surface":"(64.79491424560547)",
        "Wind_speed_surface":10.016672134399414,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":13.0067138671875,
        "Mean_period_of_wind_waves_surface":5.334681987762451,
        "Direction_of_wind_waves_surface":"(51.95960235595703)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(215.22251892089844)"
      },
      {
        "Time":"2015-01-10 00:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.4439513683319092,
        "Primary_wave_direction_surface":"(54.212337493896484)",
        "Primary_wave_mean_period_surface":5.2400221824646,
        "Wind_direction_from_which_blowing_surface":"(58.12173080444336)",
        "Wind_speed_surface":10.184938430786133,
        "Primary_wave_direction_surface":"(54.212337493896484)",
        "Primary_wave_mean_period_surface":5.2400221824646,
        "Wind_direction_from_which_blowing_surface":"(58.12173080444336)",
        "Wind_speed_surface":10.184938430786133,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":8.927277565002441,
        "Mean_period_of_wind_waves_surface":5.239500522613525,
        "Direction_of_wind_waves_surface":"(53.1713752746582)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(177.3304901123047)"
      },
      {
        "Time":"2015-01-10 06:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.4343502521514893,
        "Primary_wave_direction_surface":"(169.01821899414062)",
        "Primary_wave_mean_period_surface":10.63846206665039,
        "Wind_direction_from_which_blowing_surface":"(56.056514739990234)",
        "Wind_speed_surface":9.7272367477417,
        "Primary_wave_direction_surface":"(169.01821899414062)",
        "Primary_wave_mean_period_surface":10.63846206665039,
        "Wind_direction_from_which_blowing_surface":"(56.056514739990234)",
        "Wind_speed_surface":9.7272367477417,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":12.703091621398926,
        "Mean_period_of_wind_waves_surface":5.35332727432251,
        "Direction_of_wind_waves_surface":"(47.66685104370117)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(214.5616455078125)"
      },
      {
        "Time":"2015-01-10 12:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.4358222484588623,
        "Primary_wave_direction_surface":"(149.2631072998047)",
        "Primary_wave_mean_period_surface":15.131462097167969,
        "Wind_direction_from_which_blowing_surface":"(52.28410339355469)",
        "Wind_speed_surface":9.264154434204102,
        "Primary_wave_direction_surface":"(149.2631072998047)",
        "Primary_wave_mean_period_surface":15.131462097167969,
        "Wind_direction_from_which_blowing_surface":"(52.28410339355469)",
        "Wind_speed_surface":9.264154434204102,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":19.119674682617188,
        "Mean_period_of_wind_waves_surface":5.425998687744141,
        "Direction_of_wind_waves_surface":"(45.94091796875)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(215.8662109375)"
      },
      {
        "Time":"2015-01-10 18:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.2746937274932861,
        "Primary_wave_direction_surface":"(183.39942932128906)",
        "Primary_wave_mean_period_surface":17.9392147064209,
        "Wind_direction_from_which_blowing_surface":"(51.752281188964844)",
        "Wind_speed_surface":8.52194881439209,
        "Primary_wave_direction_surface":"(183.39942932128906)",
        "Primary_wave_mean_period_surface":17.9392147064209,
        "Wind_direction_from_which_blowing_surface":"(51.752281188964844)",
        "Wind_speed_surface":8.52194881439209,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":16.89763641357422,
        "Mean_period_of_wind_waves_surface":4.917566299438477,
        "Direction_of_wind_waves_surface":"(46.903846740722656)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(210.73635864257812)"
      },
      {
        "Time":"2015-01-11 00:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.3091187477111816,
        "Primary_wave_direction_surface":"(180.93028259277344)",
        "Primary_wave_mean_period_surface":16.630891799926758,
        "Wind_direction_from_which_blowing_surface":"(55.180206298828125)",
        "Wind_speed_surface":9.102173805236816,
        "Primary_wave_direction_surface":"(180.93028259277344)",
        "Primary_wave_mean_period_surface":16.630891799926758,
        "Wind_direction_from_which_blowing_surface":"(55.180206298828125)",
        "Wind_speed_surface":9.102173805236816,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":11.975794792175293,
        "Mean_period_of_wind_waves_surface":4.652655601501465,
        "Direction_of_wind_waves_surface":"(49.69889450073242)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(216.33346557617188)"
      },
      {
        "Time":"2015-01-11 06:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.3596055507659912,
        "Primary_wave_direction_surface":"(184.6234130859375)",
        "Primary_wave_mean_period_surface":16.158727645874023,
        "Wind_direction_from_which_blowing_surface":"(51.952213287353516)",
        "Wind_speed_surface":8.936594009399414,
        "Primary_wave_direction_surface":"(184.6234130859375)",
        "Primary_wave_mean_period_surface":16.158727645874023,
        "Wind_direction_from_which_blowing_surface":"(51.952213287353516)",
        "Wind_speed_surface":8.936594009399414,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":17.130624771118164,
        "Mean_period_of_wind_waves_surface":4.888050079345703,
        "Direction_of_wind_waves_surface":"(41.57986831665039)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(211.28060913085938)"
      },
      {
        "Time":"2015-01-11 12:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.3847342729568481,
        "Primary_wave_direction_surface":"(189.7332763671875)",
        "Primary_wave_mean_period_surface":16.10643196105957,
        "Wind_direction_from_which_blowing_surface":"(51.770389556884766)",
        "Wind_speed_surface":8.608003616333008,
        "Primary_wave_direction_surface":"(189.7332763671875)",
        "Primary_wave_mean_period_surface":16.10643196105957,
        "Wind_direction_from_which_blowing_surface":"(51.770389556884766)",
        "Wind_speed_surface":8.608003616333008,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":16.18021583557129,
        "Mean_period_of_wind_waves_surface":4.982909679412842,
        "Direction_of_wind_waves_surface":"(42.395896911621094)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(217.1558074951172)"
      },
      {
        "Time":"2015-01-11 18:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.3704301118850708,
        "Primary_wave_direction_surface":"(194.882080078125)",
        "Primary_wave_mean_period_surface":15.702735900878906,
        "Wind_direction_from_which_blowing_surface":"(50.41312789916992)",
        "Wind_speed_surface":9.25129508972168,
        "Primary_wave_direction_surface":"(194.882080078125)",
        "Primary_wave_mean_period_surface":15.702735900878906,
        "Wind_direction_from_which_blowing_surface":"(50.41312789916992)",
        "Wind_speed_surface":9.25129508972168,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":11.589153289794922,
        "Mean_period_of_wind_waves_surface":4.855980396270752,
        "Direction_of_wind_waves_surface":"(42.74496078491211)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(217.8116455078125)"
      },
      {
        "Time":"2015-01-12 00:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.3740187883377075,
        "Primary_wave_direction_surface":"(186.02020263671875)",
        "Primary_wave_mean_period_surface":14.635738372802734,
        "Wind_direction_from_which_blowing_surface":"(53.24441909790039)",
        "Wind_speed_surface":8.928038597106934,
        "Primary_wave_direction_surface":"(186.02020263671875)",
        "Primary_wave_mean_period_surface":14.635738372802734,
        "Wind_direction_from_which_blowing_surface":"(53.24441909790039)",
        "Wind_speed_surface":8.928038597106934,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":11.198307037353516,
        "Mean_period_of_wind_waves_surface":4.853966236114502,
        "Direction_of_wind_waves_surface":"(47.72218704223633)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(191.54684448242188)"
      },
      {
        "Time":"2015-01-12 06:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.3832213878631592,
        "Primary_wave_direction_surface":"(185.13250732421875)",
        "Primary_wave_mean_period_surface":14.546674728393555,
        "Wind_direction_from_which_blowing_surface":"(51.93916702270508)",
        "Wind_speed_surface":9.315688133239746,
        "Primary_wave_direction_surface":"(185.13250732421875)",
        "Primary_wave_mean_period_surface":14.546674728393555,
        "Wind_direction_from_which_blowing_surface":"(51.93916702270508)",
        "Wind_speed_surface":9.315688133239746,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":10.280016899108887,
        "Mean_period_of_wind_waves_surface":4.901954174041748,
        "Direction_of_wind_waves_surface":"(42.21376037597656)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(191.5973663330078)"
      },
      {
        "Time":"2015-01-12 12:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.4260132312774658,
        "Primary_wave_direction_surface":"(183.5241241455078)",
        "Primary_wave_mean_period_surface":13.867618560791016,
        "Wind_direction_from_which_blowing_surface":"(49.00164031982422)",
        "Wind_speed_surface":9.1680908203125,
        "Primary_wave_direction_surface":"(183.5241241455078)",
        "Primary_wave_mean_period_surface":13.867618560791016,
        "Wind_direction_from_which_blowing_surface":"(49.00164031982422)",
        "Wind_speed_surface":9.1680908203125,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":14.291522026062012,
        "Mean_period_of_wind_waves_surface":5.001134395599365,
        "Direction_of_wind_waves_surface":"(41.0109748840332)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(180.1982421875)"
      },
      {
        "Time":"2015-01-12 18:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.3619191646575928,
        "Primary_wave_direction_surface":"(197.11505126953125)",
        "Primary_wave_mean_period_surface":14.319851875305176,
        "Wind_direction_from_which_blowing_surface":"(47.59443664550781)",
        "Wind_speed_surface":9.156682014465332,
        "Primary_wave_direction_surface":"(197.11505126953125)",
        "Primary_wave_mean_period_surface":14.319851875305176,
        "Wind_direction_from_which_blowing_surface":"(47.59443664550781)",
        "Wind_speed_surface":9.156682014465332,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":14.128694534301758,
        "Mean_period_of_wind_waves_surface":4.850831985473633,
        "Direction_of_wind_waves_surface":"(40.6557731628418)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(190.88040161132812)"
      },
      {
        "Time":"2015-01-13 00:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.3700854778289795,
        "Primary_wave_direction_surface":"(188.97232055664062)",
        "Primary_wave_mean_period_surface":13.67184066772461,
        "Wind_direction_from_which_blowing_surface":"(44.80989456176758)",
        "Wind_speed_surface":9.871572494506836,
        "Primary_wave_direction_surface":"(188.97232055664062)",
        "Primary_wave_mean_period_surface":13.67184066772461,
        "Wind_direction_from_which_blowing_surface":"(44.80989456176758)",
        "Wind_speed_surface":9.871572494506836,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":14.628500938415527,
        "Mean_period_of_wind_waves_surface":4.704268455505371,
        "Direction_of_wind_waves_surface":"(42.32891082763672)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(189.94485473632812)"
      },
      {
        "Time":"2015-01-13 06:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.4584839344024658,
        "Primary_wave_direction_surface":"(190.90431213378906)",
        "Primary_wave_mean_period_surface":13.553454399108887,
        "Wind_direction_from_which_blowing_surface":"(48.78290939331055)",
        "Wind_speed_surface":10.284774780273438,
        "Primary_wave_direction_surface":"(190.90431213378906)",
        "Primary_wave_mean_period_surface":13.553454399108887,
        "Wind_direction_from_which_blowing_surface":"(48.78290939331055)",
        "Wind_speed_surface":10.284774780273438,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":13.250616073608398,
        "Mean_period_of_wind_waves_surface":4.919806957244873,
        "Direction_of_wind_waves_surface":"(40.313350677490234)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(218.18280029296875)"
      },
      {
        "Time":"2015-01-13 12:00:00 CST",
        "Significant_height_of_combined_wind_waves_and_swell_surface":1.566819667816162,
        "Primary_wave_direction_surface":"(185.93887329101562)",
        "Primary_wave_mean_period_surface":12.922161102294922,
        "Wind_direction_from_which_blowing_surface":"(45.3663330078125)",
        "Wind_speed_surface":10.267404556274414,
        "Primary_wave_direction_surface":"(185.93887329101562)",
        "Primary_wave_mean_period_surface":12.922161102294922,
        "Wind_direction_from_which_blowing_surface":"(45.3663330078125)",
        "Wind_speed_surface":10.267404556274414,
        "Mean_period_of_swell_waves_ordered_sequence_of_data":13.25422191619873,
        "Mean_period_of_wind_waves_surface":5.181985855102539,
        "Direction_of_wind_waves_surface":"(35.95257568359375)",
        "Direction_of_swell_waves_ordered_sequence_of_data":"(189.19638061523438)"
      }
    ];

    var wgram = new Wavegram(wData, 'container');
});