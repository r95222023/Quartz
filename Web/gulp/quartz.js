'use strict';

var path = require('path');
var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();

gulp.task('quartz-app', function () {
    return gulp.src([paths.src+ '/**/*.*', '!'+paths.src+ '/assets/**/*.*'])
        .pipe($.replace('obsidian','quartz'))
        .pipe($.replace('Obsidian','Quartz'))
        .pipe($.replace('obA','qtA'))
        .pipe($.replace('obB','qtB'))
        .pipe($.replace('obC','qtC'))
        .pipe($.replace('obD','qtD'))
        .pipe($.replace('obE','qtE'))
        .pipe($.replace('obF','qtF'))
        .pipe($.replace('obG','qtG'))
        .pipe($.replace('obH','qtH'))
        .pipe($.replace('obI','qtI'))
        .pipe($.replace('obJ','qtJ'))
        .pipe($.replace('obK','qtK'))
        .pipe($.replace('obL','qtL'))
        .pipe($.replace('obM','qtM'))
        .pipe($.replace('obN','qtN'))
        .pipe($.replace('obO','qtO'))
        .pipe($.replace('obP','qtP'))
        .pipe($.replace('obQ','qtQ'))
        .pipe($.replace('obR','qtR'))
        .pipe($.replace('obS','qtS'))
        .pipe($.replace('obT','qtT'))
        .pipe($.replace('obU','qtU'))
        .pipe($.replace('obV','qtV'))
        .pipe($.replace('obW','qtW'))
        .pipe($.replace('obX','qtX'))
        .pipe($.replace('obY','qtY'))
        .pipe($.replace('obZ','qtZ'))
        .pipe($.replace('ob-','qt-'))
        .pipe($.rename(function(path){
            path.dirname= path.dirname.replace('obsidian','quartz');
            path.basename = path.basename.replace('obsidian', 'quartz')
        }))
        .pipe(gulp.dest('quartzed/'))
});
gulp.task('quartz-assets', function () {
    return gulp.src([paths.src+ '/assets/**/*.*'])
        .pipe($.rename(function(path){
            path.dirname= path.dirname.replace('obsidian','quartz');
            path.basename = path.basename.replace('obsidian', 'quartz')
        }))
        .pipe(gulp.dest('quartzed/assets/'))
});

gulp.task('quartz', ['quartz-app','quartz-assets']);
