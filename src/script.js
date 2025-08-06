import tinymce from "tinymce/tinymce";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/plugins/lists";
import "../style.css";

tinymce.baseURL = "./tinymce";

let templates = ["template 1", "template 2", "template 3"];
let selectedTemplateIndex = 0;

const templatesList = document.getElementById("templatesList");
const addTemplateBtn = document.getElementById("addTemplateBtn");
const removeTemplateBtn = document.getElementById("removeTemplateBtn");
const editTemplateInput = document.getElementById("editTemplateInput");

function renderTemplatesList() {
  templatesList.innerHTML = "";
  templates.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t;
    li.dataset.index = i;
    if (i === selectedTemplateIndex) li.classList.add("selected");
    templatesList.appendChild(li);
  });
}

renderTemplatesList();

templatesList.addEventListener("click", (e) => {
  if (e.target.tagName !== "LI") return;
  selectedTemplateIndex = +e.target.dataset.index;
  renderTemplatesList();
  editTemplateInput.value = templates[selectedTemplateIndex];
});

addTemplateBtn.addEventListener("click", () => {
  templates.push("template");
  selectedTemplateIndex = templates.length - 1;
  renderTemplatesList();
  editTemplateInput.value = templates[selectedTemplateIndex];
  updateAllDropdowns(editor);
});

removeTemplateBtn.addEventListener("click", () => {
  if (templates.length === 0) return;
  templates.splice(selectedTemplateIndex, 1);
  if (selectedTemplateIndex >= templates.length) {
    selectedTemplateIndex = templates.length - 1;
  }
  renderTemplatesList();
  editTemplateInput.value =
    selectedTemplateIndex >= 0 ? templates[selectedTemplateIndex] : "";
  updateAllDropdowns(editor);
});

function applyEdit() {
  if (selectedTemplateIndex < 0) return;
  templates[selectedTemplateIndex] = editTemplateInput.value;
  renderTemplatesList();
  updateAllDropdowns(editor);
}

editTemplateInput.addEventListener("blur", applyEdit);
editTemplateInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    applyEdit();
    editTemplateInput.blur();
  }
});

function createDropdownHTML(index) {
  if (index < 0 || index >= templates.length) {
    return `<span style="color:red;font-weight:bold;">ERROR</span>`;
  }
  return `<select class="template-dropdown" data-template-index="${index}">${templates
    .map(
      (tpl, i) =>
        `<option value="${i}" ${i === index ? "selected" : ""}>${tpl}</option>`
    )
    .join("")}</select>`;
}

function updateAllDropdowns(editor) {
  if (!editor) return;

  const body = editor.getBody();
  if (!body) return;

  const selects = body.querySelectorAll("select.template-dropdown");

  selects.forEach((select) => {
    const currentValue = select.value;
    const currentIndex = parseInt(currentValue, 10);

    if (
      isNaN(currentIndex) ||
      currentIndex < 0 ||
      currentIndex >= templates.length
    ) {
      const errorSpan = editor.dom.create(
        "span",
        {
          style: "color:red;font-weight:bold;",
        },
        "ERROR"
      );

      select.replaceWith(errorSpan);
      return;
    }

    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }

    templates.forEach((tpl, i) => {
      const option = editor.dom.create("option", { value: i }, tpl);
      if (i.toString() === currentValue) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.onchange = (e) => {
      const target = e.target;
      if (target && target instanceof HTMLSelectElement) {
        target.dataset.templateIndex = target.value;
      }
    };
  });
}

let editor;

tinymce.init({
  selector: "#editor",
  setup: (ed) => {
    editor = ed;

    document.getElementById("insertBtn").addEventListener("click", () => {
      const dropdownHTML = createDropdownHTML(selectedTemplateIndex);
      editor.insertContent(dropdownHTML);

      setTimeout(() => {
        updateAllDropdowns(editor);
      }, 100);
    });

    ed.on("init", () => updateAllDropdowns(editor));
  },
});
