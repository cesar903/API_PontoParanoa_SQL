import jsPDF from "jspdf";
import Logo from "../assets/Logo.png";

export default function PDFRegister(form, assinaturas = {}) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const secondaryColor = "#4B4B4B";
    const lineColor = "#cccccc";

    const formatarData = (data) => {
        if (!data) return "__/__/____";
        const partes = data.split("-");
        if (partes.length !== 3) return data;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    };



    doc.addImage(Logo, "PNG", 10, 8, 75, 20);


    doc.setFontSize(14);
    doc.setTextColor("#00aded");
    doc.setFont("helvetica", "bold");
    doc.text("FICHA DE INSCRIÇÃO - GINÁSTICA", 105, 34, { align: "center" });


    doc.setFillColor(secondaryColor);
    doc.rect(10, 38, 190, 8, "F");
    doc.setFontSize(11);
    doc.setTextColor("#ffffff");
    doc.text("1 - DADOS PESSOAIS DO ALUNO (A)", 15, 43);

    let startY = 50;
    const lineHeight = 6;

    const drawField = (label, value) => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text(label, 15, startY);

        doc.setFont("helvetica", "bold");
        doc.text(value || "__________________", 15 + doc.getTextWidth(label) + 1, startY);

        startY += lineHeight;
    };


    drawField("Nome Completo:", form.nome);
    drawField("Data de Nascimento:", formatarData(form.nascimento));
    drawField("E-mail:", form.email);
    drawField("RG:", form.rg);
    drawField("CPF:", form.cpf);
    drawField("Telefone/Celular:", form.telefone);
    drawField("Tamanho da Camiseta:", form.camisa);
    drawField("Setor que trabalha:", form.setor);
    drawField("RE:", form.re);


    doc.setDrawColor(lineColor);
    doc.setLineWidth(0.3);
    doc.line(10, startY - 2, 200, startY - 2);

    startY += 4;
    doc.setFillColor(secondaryColor);
    doc.rect(10, startY - 6, 190, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#ffffff");
    doc.text("2 - ENDEREÇO", 15, startY);

    startY += lineHeight + 1;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);

    drawField(
        "Endereço:",
        `${form.endereco?.rua || "__________________"} Nº: ${form.endereco?.numero || "__"}`
    );
    drawField(
        "Bairro:",
        `${form.endereco?.bairro || "______"} Cidade: ${form.endereco?.cidade || "______"}`
    );
    drawField(
        "CEP:",
        `${form.endereco?.cep || "______"} Complemento: ${form.endereco?.complemento || "Não possui"}`
    );


    startY += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Declaro a veracidade das informações acima declaradas.", 15, startY);

    startY += lineHeight;
    const declaracao =
        "Estou ciente que este é um benefício da empresa e que posso utilizar durante todo o período vigente do meu contrato de trabalho.";
    const lines = doc.splitTextToSize(declaracao, 180);
    doc.text(lines, 15, startY);

    startY += lines.length * (lineHeight - 1.5);
    doc.text(`Diadema, ${formatarData(form.dataDeclaracao)}`, 15, startY + 6);

    startY += 25;
    const assinaturaSpacing = 20;


    if (assinaturas["Aluno(a)/Responsável"]) {
        doc.addImage(assinaturas["Aluno(a)/Responsável"], "PNG", 15, startY - 15, 50, 20);
    }
    doc.text("____________________________________", 15, startY);
    doc.setFont("helvetica", "normal");
    doc.text("ASSINATURA ALUNO (A)", 15, startY + 4);

    doc.setFont("helvetica", "bold");
    doc.text("____________________________________", 110, startY);
    doc.setFont("helvetica", "normal");
    doc.text("ASSINATURA ESCOLA DIGITAL PARANOÁ", 110, startY + 4);
    doc.text("(Gerente Thaís Muller Xavier)", 110, startY + 8);

    doc.setFont("helvetica", "bold");
    doc.text("____________________________________", 15, startY + assinaturaSpacing);
    doc.setFont("helvetica", "normal");
    doc.text("Profissional Educacional (Quezia Arruda)", 15, startY + assinaturaSpacing + 4);

    return doc;
}
