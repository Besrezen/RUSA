document.getElementById('any').addEventListener('change', function () {
    var otherCheckboxes = document.querySelectorAll('#seasonForm input[type=checkbox]:not(#any)');
    if (this.checked) {
        otherCheckboxes.forEach(function (checkbox) {
            checkbox.checked = false;
            checkbox.disabled = true;
        });
    } else {
        otherCheckboxes.forEach(function (checkbox) {
            checkbox.disabled = false;
        });
    }
});