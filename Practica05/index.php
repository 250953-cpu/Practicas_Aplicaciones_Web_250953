<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Primer Página Web En PHP-250953</title>
</head>
<body>
<?php
//Declaración de una variable de tipo String
$nombre = "Juan Fernando Hernandez Lopez";
$carreraEstudia="T.S.U En Desarrollo De Software Multiplatorma";
echo "<h1> Hola Mundo Desde PHP!</h1>";
#Esta línea imprime la versión de PHP
echo "<h2> Estas Usando La Versión De PHP:" . phpversion() . "</h2>";
?>
<!-- Este es un comentario en HTML,
 este no es necesario entrar dentro de PHP,
 si entra en el marcara error-->
<hr>

<?php
/* Después de asignarle un valor a la variable $nombre,
podemos imprimirla en pantalla */
echo "<h3>Mi nombre es: $nombre <h3>";
echo "<h3>Mi nombre es: $nombre y estudio : $carreraEstudia <h3>";

?>

<?php
/*Global Scope - Alcance Global*/
$x = 10;
$y = 5;
$z = '3';

echo "<h3>La suma de $x + $y es:" . ($x + $y) . "<h3>";
echo "<h3>La suma de $x + $y + $z es:" . ($x + $y + $z) . "<h3>";


/*Local Scope - Alcance Local*/
function multiplicar($a, $b)
{
    $resultado = $a * $b;
    echo "<h4>La multiplicación de $a * $b es: $resultado <h4>";
    return $resultado;

}

    echo "<h4>La multiplicación de 3 X 3 es:" . multiplicar(3, 3) . "<h4>";
    echo "<h4>La multiplicación de $x X $y es:" . multiplicar($x, $y) . "<h4>";
    echo "<h4>La multiplicación de 1250 X 325 es:" . multiplicar(1250, 325) . "<h4>";
    echo "<hr>";
    echo "<p>El Resultado De La Última Multiplicación Es: $resultado </p>";

    /*Static Scope - Alcance Estático */
    function myTest()
    {
        static $w = 0; //static scope
        echo "$w <br>";
        $w++;
    }
    myTest();
    myTest();
    myTest();
    myTest();
    myTest();
    echo "$w";
    myTest();
    myTest();

    #Función para saber el tipo de dato de una variable
    /*var_dump() es una función que nos permite conocer
    el tipo de dato de una variable y su valor, no es
    necesario programarla porque ya está implementada en PHP*/

    echo "<p> Las variables  <strong>nombre</strong> es de tipo:";
    var_dump($nombre);
    echo "</p>";

    echo "<p> Las variables  <strong>nombre</strong> es de tipo:";
    var_dump($carreraEstudia);
    echo "</p>";

    $fecha_nacimiento = date("2006/06/13");
    
    echo "<p> Las variables  <strong>fecha_nacimiento</strong> es de tipo:";
    var_dump($fecha_nacimiento);
    echo "</p>";

    $fecha_hoy = date("Y/m/d");
    $edad_actual = $fecha_hoy - $fecha_nacimiento;
    echo "<p> La edad actual es: $edad_actual </p>";
?>

</html>