/**
 * Created by iacob.campia@gmail.com.
 * Date: 2/14/11
 * Time: 2:02 PM
 */

$(document).ready(function(){

    module("Core");

    test("Runtime libraries loading", function() {
        expect(4);

        jClass.config.librariesPath = "libtest";

        raises(function() {
            jClass.require("my.test")
        }, "Raise error on 404");

        try {
            jClass.require("my.namespace.testfile");
            ok(TEST, "Load file by namespace : my.namespace.testfile");
        } catch (ex) { throw(ex.message); }

        delete(TEST);

        try {
            jClass.require("libtest/testfile2.js");
            ok(TEST2, "Load file by name : libtest/testfile2.js");
        } catch (ex) { throw (ex.message) }

        try {
            jClass.require("http://adm/jClass/tests/libtest/testfile3.js");
            ok(TEST3, "Load file from full URL")
        } catch (ex) { throw (ex.message) }

    })

});