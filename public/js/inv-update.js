const form = document.querySelector("#edit-inv-form")
form.addEventListener("change", function () {
    const updateBtn = document.querySelector("#submit")
    updateBtn.removeAttribute("disabled")
})