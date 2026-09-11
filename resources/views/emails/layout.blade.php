<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title')</title>
    <style>
        body {
            background: #fff6ef;
            margin: 0;
            font-family: Arial;
            font-size: 14px;
        }

        table {
            background: #fff;
            padding: 0;
            border: 0;
            border-collapse: 0;
        }

        a {
            text-decoration: none;
            color: #0e436f;
        }

        .button {
            font-size: 14px;
            line-height: 100%;
            font-weight: 700;
            color: #0e436f;
            padding: 5px 10px;
            background-color: #FFDE59;
            border: #FFB40B solid 1px;
            border-radius: 6px !important;
        }
    </style>
</head>

<body>
    <div style="width:500px;">
        <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td style="padding:15px 30px;">

                    @yield('content')

                </td>
            </tr>
        </table>
    </div>
</body>

</html>
