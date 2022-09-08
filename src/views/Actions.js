import eyeBlueIcon from "../assets/svg/eye_blue.js"
import downloadBlueIcon from "../assets/svg/download_blue.js"
import { extFile } from "../app/format.js"

export default (billUrl, fileName) => {
  // Extension pdf ou type image
  const ext = extFile(fileName);
  let html =
    `<div class="icon-actions">
      <div id="eye" data-testid="icon-eye" data-bill-url=${billUrl} data-file-ext=${ext}>
      ${eyeBlueIcon}
      </div>`;
  // Les documents pdf se téléchargent
  if (ext === "pdf") {
    html += `<div id="download" data-testid="icon-download" data-bill-url=${billUrl} data-file-ext=${ext}>
    ${downloadBlueIcon}
    </div>`;
  }
  html.concat(`</div>`);
  return html;
}