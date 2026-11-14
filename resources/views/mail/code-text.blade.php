@if (! empty($name))
Hi {{ $name }},

@endif
{{ $heading }}

{{ $intro }}

Your PawControl code is: {{ $code }}

This code expires in {{ $expiresInMinutes }} minutes.

{{ $footer }}
