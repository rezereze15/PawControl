@if (! empty($name))
Hi {!! $name !!},

@endif

This is a friendly reminder about your pet's upcoming visit to the clinic.

@foreach ($details as $label => $value)
{!! $label !!}: {!! $value !!}
@endforeach

Please arrive on time.
