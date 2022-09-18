import eyeBlueIcon from "../assets/svg/eye_blue.js"
import downloadBlueIcon from "../assets/svg/download_blue.js"
import { extFile } from "../app/format.js"

export default (billUrl, fileName) => {
  // pdf ou type image
  const ext = extFile(fileName);
  return (
    `<div class="icon-actions">
      <div id="eye" data-testid="icon-eye" data-bill-url=${billUrl} data-file-ext=${ext}>
      ${(ext === "pdf") ? downloadBlueIcon : eyeBlueIcon}
      </div>
    </div>`
  )
}