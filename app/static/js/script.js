// Sayfanın yüklenmesi tamamlandığında çalışacak olan fonksiyon
document.addEventListener("DOMContentLoaded", function() {
    const dataSelection = document.getElementById('data-selection');
    s1_checkSelection(dataSelection.value);
});

// Veri kaynağı türü olarak Excel seçiliyse Dosya Yolu dropdown gozukur
function s1_checkSelection(value) {
    const filePath = document.getElementById('s1_file-path');
    filePath.style.display = value === 'Excel' ? 'block' : 'none';
}
