'use strict';

var path = require('path');
var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();
var oldPrefix='tri';
var oldName='triangular';
var oldNameC = 'Triangular';
var newPrefix='mdd';
var newName='mdDashboard';
var newNameC = 'MDDashboard';
gulp.task('rename-app', function () {
    var res;
    var evalStr = "res=gulp.src([paths.src+ '/**/*.*', '!'+paths.src+ '/assets/**/*.*'])" +
        ".pipe($.replace('"+oldName+"','"+newName+"'))" +
        ".pipe($.replace('"+oldNameC+"','"+newNameC+"'))";
    var letters=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','-'];
    letters.forEach(function(letter){
        var _old = oldPrefix+letter;
        var _new = newPrefix+letter;
        evalStr+=".pipe($.replace('"+_old+"','"+_new+"'))";
    });
    evalStr+=".pipe($.rename(function(path){path.dirname= path.dirname.replace('"+oldName+"','"+newName+"');path.basename = path.basename.replace('"+oldName+"', '"+newName+"')})).pipe(gulp.dest('renamed/'))";
    eval(evalStr);
    return res;
});
gulp.task('rename-assets', function () {
    return gulp.src([paths.src+ '/assets/**/*.*'])
        .pipe($.rename(function(path){
            path.dirname= path.dirname.replace(oldName,newName);
            path.basename = path.basename.replace(oldName, newName);
        }))
        .pipe(gulp.dest('renamed/assets/'));
});

gulp.task('rename', ['rename-app','rename-assets']);