window.config=window.config||{};
window.config.googleChart=function() {
    'use strict';

    angular
        .module('app')
        .value('googleChartApiConfig', {
            version: '1.1',
            optionalSettings: {
                packages: ['line', 'bar', 'geochart', 'scatter'],
                language: 'en'
            }
        });
};
//window.config.googleChart();
