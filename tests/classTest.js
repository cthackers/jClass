/**
 * Created by iacob.campia@gmail.com.
 * Date: 2/14/11
 * Time: 1:43 PM
 */

$(document).ready(function(){
    module("Core");

    test("Classes", function() {

        var tmp = jClass({
            constructor : function(init) {
                console.log("inside constructr", init);
            },
            public : {
                test : function(argument) {
                    console.log("test method", argument)
                },
                val : 2
            },
            private : {
                testPrivate : function(argument) {
                    console.log("test private", argument)
                },
                value : 3
            },
            static : {
                STAT : function(argument) {
                    console.log("static", argument)
                },
                STAT_VAL : 4
            }
        });

        ok(true, "class test")
        console.log("class");
        console.dir(tmp);

        var x = new tmp();

        console.log("instance");
        console.dir(x);

    });
});