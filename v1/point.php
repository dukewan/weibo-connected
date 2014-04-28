<?php

class point {
    function  __construct () {
        header("Content-type:text/html;charset=UTF-8");
        date_default_timezone_set('PRC');
        ini_set('max_execution_time', '200000');

        $this->conn();
        $this->generate();
    }

    public function conn() {
        mysql_connect("localhost", "root", "") or die("db connect error");
        mysql_select_db("weibo")  or die("db select database error");;
        mysql_query("set names 'utf8'");
        $this->log(true, "connect db ok!");
    }

    public function generate() {
        $start = date("Y-m-d H:i:s");
        $this->log(true, "处理开始，时间:".$start);

        $sql = "select * from users_small_2 limit 30000";
        $re = mysql_query($sql);

        $arr = array();
        $arr["type"] = "FeatureCollection";
        $arr["features"] = array();

        while ($row = mysql_fetch_row($re)) {
            $point = array(
                "type" => "Feature",
                "geometry" => array(
                    "type" => "Point",
                    "coordinates" => array($row[4], $row[5])
                ),
                "properties" => array(
                    "id" => $row[0],
                   /* "uid" => $row[1],
                    "nickname" => $row[2],
                    "location" => $row[3],
                    "description" => $row[6],
                    "gender" => $row[7],
                    "followers_count" => $row[8],
                    "friends_count" => $row[9],
                    "bi_followers_count" => $row[10],
                    "verified" => $row[11],
                    "verified_reason" => $row[12]*/
                )
            );
            array_push($arr["features"], $point);

            $this->log(true, "生成 ".$row[0]." 的json信息");
        }
        $json = json_encode($arr);
//        echo $json;
        file_put_contents("user.json", $json);

        $end = date("Y-m-d H:i:s");
        $this->log(true, "处理完毕，时间:".$end);
    }


    public  function log($type, $msg) {
        //echo ($type ? "Success: ": "Error: ").$msg."<br/>";
    }
}

new point();
