function analyzeData()
{
    let moisture =
    parseFloat(document.getElementById("moisture").value);

    let temperature =
    parseFloat(document.getElementById("temperature").value);

    let rainfall =
    parseFloat(document.getElementById("rainfall").value);

    let result =
    document.getElementById("result");

    if(moisture < 30 && rainfall < 5)
    {
        result.innerHTML =
        "🚨 IRRIGATE IMMEDIATELY";
    }

    else if(moisture >= 30 && moisture <= 50)
    {
        result.innerHTML =
        "⚠ Moderate Moisture - Monitor Field";
    }

    else
    {
        result.innerHTML =
        "✅ NO IRRIGATION REQUIRED";
    }
}