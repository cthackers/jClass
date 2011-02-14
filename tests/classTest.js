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
                asd : function() {
                    return 1;
                },
                test : function(argument) {
                    return [value, this.val, testPrivate()];
                },
                val : 22
            },
            private : {
                testPrivate : function(argument) {
                    return [this.asd(), this.val];
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


        var x = new tmp(2);
        console.dir(x);
        x.val = 10;
        console.log(x.test(), x.val)
    });
});