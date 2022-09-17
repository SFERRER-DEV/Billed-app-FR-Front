import eyeBlueIcon from "../assets/svg/eye_blue.js"
import downloadBlueIcon from "../assets/svg/download_blue.js"

export default (billUrl, fileName) => {
  // Obtenir l'extension dans le nom du fichier 
  const arr = /^.+\.([^.]+)$/.exec(fileName);
  const ext = arr == null ? "" : arr[1].trim().toLowerCase();
  return (
    `<div class="icon-actions">
      <div id="eye" data-testid="icon-eye" data-bill-url=${billUrl} data-file-ext=${ext}>
      ${(ext === "pdf") ? downloadBlueIcon : eyeBlueIcon}
      </div>
    </div>`
  )
}