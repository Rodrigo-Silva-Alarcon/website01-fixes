@extends('emails.layout')

@section('title', 'Contacto Red Agua')
		
@section('content')

<p>Recibiste un mensaje de: {{ $msg['name'] }}  - {{ $msg['email'] }}</p>
<p><strong>Nombres y Apellidos:</strong> {{ $msg['name'] }}</p>
<p><strong>Correo electrónico:</strong> {{ $msg['email'] }}</p>	
<p><strong>Empresa:</strong> {{ $msg['company'] ?? '' }}</p>	
<p><strong>teléfono:</strong> {{ $msg['phone'] }}</p>	
<p>{{ $msg['message'] ?? '' }}</p>			
<p>E-mail enviado desde <a href="{{ env('APP_URL') }}" target="_blank">RedAgua</a></p>			
<!-- Appointment End -->

@endsection