'use strict';

var path = require('path');
var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();

gulp.task('obsidian-app', function () {
    return gulp.src([paths.src + '/**/*.*', '!' + paths.src + '/assets/**/*.*'])
        .pipe($.replace('quartz', 'obsidian'))
        .pipe($.replace('Quartz', 'Obsidian'))
        .pipe($.replace('qtA', 'obA'))
        .pipe($.replace('qtB', 'obB'))
        .pipe($.replace('qtC', 'obC'))
        .pipe($.replace('qtD', 'obD'))
        .pipe($.replace('qtE', 'obE'))
        .pipe($.replace('qtF', 'obF'))
        .pipe($.replace('qtG', 'obG'))
        .pipe($.replace('qtH', 'obH'))
        .pipe($.replace('qtI', 'obI'))
        .pipe($.replace('qtJ', 'obJ'))
        .pipe($.replace('qtK', 'obK'))
        .pipe($.replace('qtL', 'obL'))
        .pipe($.replace('qtM', 'obM'))
        .pipe($.replace('qtN', 'obN'))
        .pipe($.replace('qtO', 'obO'))
        .pipe($.replace('qtP', 'obP'))
        .pipe($.replace('qtQ', 'obQ'))
        .pipe($.replace('qtR', 'obR'))
        .pipe($.replace('qtS', 'obS'))
        .pipe($.replace('qtT', 'obT'))
        .pipe($.replace('qtU', 'obU'))
        .pipe($.replace('qtV', 'obV'))
        .pipe($.replace('qtW', 'obW'))
        .pipe($.replace('qtX', 'obX'))
        .pipe($.replace('qtY', 'obY'))
        .pipe($.replace('qtZ', 'obZ'))
        .pipe($.replace('qt-', 'ob-'))
        .pipe($.rename(function (path) {
            path.dirname = path.dirname.replace('quartz', 'obsidian');
            path.basename = path.basename.replace('quartz', 'obsidian')
        }))
        .pipe(gulp.dest('obsidianized/'))
});
gulp.task('obsidian-assets', function () {
    return gulp.src([paths.src + '/assets/**/*.*'])
        .pipe($.rename(function (path) {
            path.dirname = path.dirname.replace('quartz', 'obsidian');
            path.basename = path.basename.replace('quartz', 'obsidian')
        }))
        .pipe(gulp.dest('obsidianized/assets/'))
});

gulp.task('obsidian', ['obsidian-app', 'obsidian-assets']);
