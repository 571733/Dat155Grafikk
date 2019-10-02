"use strict";

var shadedCube = function () {

    var canvas;
    var gl;

    var numVertices = 36;

    var pointsArray = [];
    var normalsArray = [];

    /*var vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

     */

    var vertices = [
        vec4(-0.25, -0.25, 0.25, 1.0),
        vec4(-0.25, 0.25, 0.25, 1.0),
        vec4(0.25, 0.25, 0.25, 1.0),
        vec4(0.25, -0.25, 0.25, 1.0),
        vec4(-0.25, -0.25, -0.25, 1.0),
        vec4(-0.25, 0.25, -0.25, 1.0),
        vec4(0.25, 0.25, -0.25, 1.0),
        vec4(0.25, -0.25, -0.25, 1.0)
    ];

    var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
    var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
    var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
    var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

//Gull
    var materialAmbientG = vec4(0.24725, 0.1995, 0.0745, 1);
    var materialDiffuseG = vec4(0.75164, 0.60648, 0.22648, 1);
    var materialSpecularG = vec4(0.6282281, 0.555802, 0.366065, 1);
    var materialShininessG = 51.2;

//Bronse
    var materialAmbientB = vec4(0.2125, 0.1275, 0.054, 1);
    var materialDiffuseB = vec4(0.714, 0.4284, 0.18144, 1);
    var materialSpecularB = vec4(0.393548, 0.271906, 0.166721, 1);
    var materialShininessB = 25.6
    ;


    var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
    var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
    var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
    var materialShininess = 100.0;

    var ctm;
    var ambientColor, diffuseColor, specularColor;
    var modelViewMatrix, projectionMatrix;
    var viewerPos;
    var program;
    var program1;


    var xAxis = 0;
    var yAxis = 1;
    var zAxis = 2;
    var axis = 0;
    var theta = vec3(0, 0, 0);

    var thetaLoc;

    var flag = false;

    function quad(a, b, c, d) {

        var t1 = subtract(vertices[b], vertices[a]);
        var t2 = subtract(vertices[c], vertices[b]);
        var normal = cross(t1, t2);
        normal = vec3(normal);


        pointsArray.push(vertices[a]);
        normalsArray.push(normal);
        pointsArray.push(vertices[b]);
        normalsArray.push(normal);
        pointsArray.push(vertices[c]);
        normalsArray.push(normal);
        pointsArray.push(vertices[a]);
        normalsArray.push(normal);
        pointsArray.push(vertices[c]);
        normalsArray.push(normal);
        pointsArray.push(vertices[d]);
        normalsArray.push(normal);
    }


    function colorCube() {
        quad(1, 0, 3, 2);
        quad(2, 3, 7, 6);
        quad(3, 0, 4, 7);
        quad(6, 5, 1, 2);
        quad(4, 5, 6, 7);
        quad(5, 4, 0, 1);
    }


    window.onload = function init() {
        canvas = document.getElementById("gl-canvas");

        gl = canvas.getContext('webgl2');
        if (!gl) {
            alert("WebGL 2.0 isn't available");
        }


        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);

        gl.enable(gl.DEPTH_TEST);

        //
        //  Load shaders and initialize attribute buffers
        //
        program = initShaders(gl, "vertex-shader", "fragment-shader");
        // gl.useProgram( program );

        program1 = initShaders(gl, "vertex-shader1", "fragment-shader1");
        //gl.useProgram( program );

        colorCube();

        var nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

        var normalLoc = gl.getAttribLocation(program, "aNormal");
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalLoc);

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        thetaLoc = gl.getUniformLocation(program, "theta");

        viewerPos = vec3(0.0, 0.0, 20.0);

        projectionMatrix = ortho(-1, 1, -1, 1, -100, 100);


        document.getElementById("ButtonX").onclick = function () {
            axis = xAxis;
        };
        document.getElementById("ButtonY").onclick = function () {
            axis = yAxis;
        };
        document.getElementById("ButtonZ").onclick = function () {
            axis = zAxis;
        };
        document.getElementById("ButtonT").onclick = function () {
            flag = !flag;
        };


        render();
    }

    var render = function () {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //Gull
        gl.useProgram(program);

        var ambientProduct = mult(lightAmbient, materialAmbientG);
        var diffuseProduct = mult(lightDiffuse, materialDiffuseG);
        var specularProduct = mult(lightSpecular, materialSpecularG);

        gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
            ambientProduct);
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
            diffuseProduct);
        gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
            specularProduct);
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
            lightPosition);

        gl.uniform1f(gl.getUniformLocation(program,
            "shininess"), materialShininessG);

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"),
            false, flatten(projectionMatrix));


        if (flag) theta[axis] += 2.0;

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, translate(-0.5,0,0));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));

//console.log(modelView);

        gl.uniformMatrix4fv(gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelViewMatrix));

        gl.drawArrays(gl.TRIANGLES, 0, numVertices);

        //Bronse
        gl.useProgram(program1);

        ambientProduct = mult(lightAmbient, materialAmbientB);
        diffuseProduct = mult(lightDiffuse, materialDiffuseB);
        specularProduct = mult(lightSpecular, materialSpecularB);

        gl.uniform4fv(gl.getUniformLocation(program1, "ambientProduct"),
            ambientProduct);
        gl.uniform4fv(gl.getUniformLocation(program1, "diffuseProduct"),
            diffuseProduct);
        gl.uniform4fv(gl.getUniformLocation(program1, "specularProduct"),
            specularProduct);
        gl.uniform4fv(gl.getUniformLocation(program1, "lightPosition"),
            lightPosition);

        gl.uniform1f(gl.getUniformLocation(program1,
            "shininess"), materialShininessB);

        gl.uniformMatrix4fv(gl.getUniformLocation(program1, "projectionMatrix"),
            false, flatten(projectionMatrix));


        if (flag) theta[axis] += 2.0;

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, translate(0.5,0,0));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));

//console.log(modelView);

        gl.uniformMatrix4fv(gl.getUniformLocation(program1,
            "modelViewMatrix"), false, flatten(modelViewMatrix));

        gl.drawArrays(gl.TRIANGLES, 0, numVertices);


        requestAnimationFrame(render);
    }

}

shadedCube();
