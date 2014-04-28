<?php

class cope {
    function  __construct () {
        header("Content-type:text/html;charset=UTF-8");
        date_default_timezone_set('PRC');
        ini_set('max_execution_time', '0');

        $this->conn();
        $this->transform();
    }

    public function conn() {
        mysql_connect("localhost", "root", "") or die("db connect error");
        mysql_select_db("weibo")  or die("db select database error");;
        mysql_query("set names 'utf8'");

        $this->log(true, "connect db ok!");
    }

    public function transform() {
        $start = date("Y-m-d H:i:s");
        $this->log(true, "处理开始，时间:".$start);

        $sql = "select id, location from location where longitude='' or longitude is null";
        $re = mysql_query($sql);
        $baseUrl = "http://api.map.baidu.com/geocoder/v2/?ak=8E0128CBcbb1e4f76c520f2fe3091feb&output=json&address=";

        while ($row = mysql_fetch_row($re)) {
            $json = json_decode(file_get_contents($baseUrl.str_replace(" ", "",$row[1])), true);
            $id = $row[0];
            $updateSql = "update location set longitude='".$json["result"]["location"]["lng"]."', latitude='".$json["result"]["location"]["lat"]."' where id=".$id;
//            var_dump($updateSql);
//            var_dump(mysql_query($updateSql));
            mysql_query($updateSql);
            $this->log(true, "更新 ".$id." 的位置信息");
        }

        $end = date("Y-m-d H:i:s");
        $this->log(true, "处理完毕，时间:".$end);
    }


    public  function log($type, $msg) {
        echo ($type ? "Success: ": "Error: ").$msg."<br/>";
    }
}

new cope();
