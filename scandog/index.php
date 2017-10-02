<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>Scandog</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="icon" href="assets/scandog.png">
	<!-- Bootstrap -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
	<script src="https://code.jquery.com/jquery-3.1.0.js"></script>
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
	<link href="assets/style.css" rel="stylesheet" type="text/css">
</head>

<body>

<nav class="navbar navbar-inverse navbar-static-top">
  <div class="container">
    <!-- Brand and toggle get grouped for better mobile display -->
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="#">
      	<img alt="Scandog logo" src="assets/scandoglogo.png
      	">
      </a>
    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <ul class="nav navbar-nav navbar-right">
        <li><a href="#">Link</a></li>
        <li class="dropdown">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
          <ul class="dropdown-menu">
            <li><a href="#">Action</a></li>
            <li><a href="#">Another action</a></li>
            <li><a href="#">Something else here</a></li>
            <li role="separator" class="divider"></li>
            <li><a href="#">Separated link</a></li>
          </ul>
        </li>
      </ul>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>

<div class="wrapper"> 
	<div class="container container-white">
		<div class="row">
			<div class="col-md-offset-0 col-md-6 col-sm-9">
				<h1>Scandog</h1>
				<p>Scan your product, and we can send it to your home!</p>
			</div>
      <div class="col-sm-6 col-sm-offset-3 col-md-offset-0 col-md-6">
        <video autoplay="true" id="webcam">

        </video>
          <!--<script> 
            var video = document.querySelector("#webcam");

            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

            if (navigator.getUserMedia) {       
            navigator.getUserMedia({video: true}, handleVideo, videoError);
            }

            function handleVideo(stream) {
            video.src = window.URL.createObjectURL(stream);
            }

            function videoError(e) {
            // do something
            }
          </script>
          //-->
        </div>
        <div class="col-sm-6 col-sm-offset-3 col-md-6 col-md-offset-6">
          <button class="btn-danger scanbtn">scan</button>
        </div>
		</div>

	</div>

  <div class="container container-white margin-top margin-bottom">
    <div class="row">
      <div class="col-md-6 col-sm-12">
        <h1>Scandog</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce a sodales enim. Maecenas in ipsum eget enim luctus gravida. Donec a commodo mauris. Maecenas eu elit hendrerit, cursus diam congue, euismod lorem. Donec gravida tortor velit, euismod laoreet justo lobortis eget. Integer lobortis lobortis risus, nec iaculis urna venenatis quis. Quisque id ullamcorper ligula. Ut ut malesuada elit. In lectus augue, egestas non urna et, laoreet feugiat tortor. Quisque vel odio imperdiet tortor tincidunt rhoncus at in turpis. Nam risus nibh, ullamcorper sed ipsum quis, lobortis vestibulum quam. Suspendisse interdum erat id ligula rhoncus feugiat. Morbi eu sagittis lacus.</p>
      </div>
      <div class="col-md-6 col-sm-12">
        <h1>Scandog</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce a sodales enim. Maecenas in ipsum eget enim luctus gravida. Donec a commodo mauris. Maecenas eu elit hendrerit, cursus diam congue, euismod lorem. Donec gravida tortor velit, euismod laoreet justo lobortis eget. Integer lobortis lobortis risus, nec iaculis urna venenatis quis. Quisque id ullamcorper ligula. Ut ut malesuada elit. In lectus augue, egestas non urna et, laoreet feugiat tortor. Quisque vel odio imperdiet tortor tincidunt rhoncus at in turpis. Nam risus nibh, ullamcorper sed ipsum quis, lobortis vestibulum quam. Suspendisse interdum erat id ligula rhoncus feugiat. Morbi eu sagittis lacus.</p>
      </div>
      
    </div>

  </div>

</div>


</body>

