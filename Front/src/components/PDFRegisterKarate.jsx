import jsPDF from "jspdf";
import Logo from "../assets/Logo.png";

// Recebe form e o objeto assinaturas
export default function PDFKarateRegister(form, assinaturas = {}, perfil) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const secondaryColor = "#4B4B4B";
    const lineColor = "#cccccc";
    const pageWidth = 210;
    const pageHeight = 297;
    const lineHeight = 6;
    let startY = 50;

    const formatarData = (data) => {
        if (!data) return "__/__/____";
        const partes = data.split("-");
        if (partes.length !== 3) return data;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    };

    // Função auxiliar para verificar e adicionar nova página
    const checkPageBreak = (requiredSpace) => {
        if (startY + requiredSpace > pageHeight - 20) {
            doc.addPage();
            startY = 20; // Novo Y inicial na nova página
            return true;
        }
        return false;
    };

    // Função auxiliar para desenhar campos
    const drawField = (label, value) => {
        checkPageBreak(lineHeight);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text(label, 15, startY);

        doc.setFont("helvetica", "bold");
        doc.text(value || "__________________", 15 + doc.getTextWidth(label) + 1, startY);

        startY += lineHeight;
    };

    // Função auxiliar para desenhar o cabeçalho da seção
    const drawSectionHeader = (title) => {
        checkPageBreak(12);
        doc.setFillColor(secondaryColor);
        doc.rect(10, startY - 6, 190, 8, "F");
        doc.setFontSize(11);
        doc.setTextColor("#ffffff");
        doc.setFont("helvetica", "bold");
        doc.text(title, 15, startY);
        startY += lineHeight + 1;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
    };

    // --- PÁGINA 1 ---

    // --- Logo e Título Principal ---
    doc.addImage(Logo, "PNG", 10, 8, 70, 20);
    doc.setFontSize(14);
    doc.setTextColor("#00aded");
    doc.setFont("helvetica", "bold");
    doc.text("FICHA DE INSCRIÇÃO - KARATÊ", pageWidth / 2, 34, { align: "center" });
    startY = 50;

    // --- SEÇÃO 1: DADOS PESSOAIS DO ALUNO (A) ---
    drawSectionHeader("1 - DADOS PESSOAIS DO ALUNO (A)");

    drawField("Nome Completo:", form.nome);
    drawField("Data de Nascimento:", formatarData(form.nascimento));
    drawField("E-mail:", form.email);
    drawField("Telefone/Celular:", form.telefone);
    drawField("CPF:", form.cpf);
    drawField("RG:", form.rg);
    drawField("Tamanho da Camiseta:", form.camisa);
    drawField("Tamanho do Chinelo:", form.chinelo);
    drawField("Tamanho do Kimono:", form.kimono);
    drawField("Modalidade:", form.modalidade);
    drawField("Já praticou alguma Modalidade Anterior?:", form.modalidadeAnterior);

    // --- Foto (Placeholder) ---
    checkPageBreak(25);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    if (perfil) { 
        doc.addImage(perfil, "PNG", 145, 52, 50, 50);
    } else {
        doc.rect(145, 52, 50, 50);
    }

    startY += 3;


    // Linha separadora
    doc.setDrawColor(lineColor);
    doc.setLineWidth(0.3);
    doc.line(10, startY - 2, 200, startY - 2);
    startY += 4;


    // --- SEÇÃO 3: INFORMAÇÕES DE SAÚDE ---
    drawSectionHeader("2 - INFORMAÇÕES DE SAÚDE");

    drawField("Tratamento de Saúde (Detalhe):", form.tratamentoSaudeDetalhe);
    drawField("Transtorno/Deficiência (Detalhe):", form.transtornoDetalhe);
    drawField("CID:", form.cid);
    drawField("Laudo/Atestado:", form.laudo);
    drawField("Acompanhamento médico:", form.acompanhamento);
    drawField("Medicamento de uso contínuo:", form.medicamento);

    // Linha separadora
    doc.line(10, startY - 2, 200, startY - 2);
    startY += 4;

    // --- PÁGINA 2 ---
    checkPageBreak(12);

    // --- SEÇÃO 4: ENDEREÇO E MORADIA ---
    drawSectionHeader("3 - ENDEREÇO");

    drawField("CEP:", form.endereco?.cep);
    drawField(
        "Endereço:",
        `${form.endereco?.rua || "__________________"} Nº: ${form.endereco?.numero || "__"}`
    );
    drawField(
        "Bairro e Cidade:",
        `${form.endereco?.bairro || "______"} / ${form.endereco?.cidade || "______"}`
    );
    drawField("Complemento:", form.endereco?.complemento || "Não possui");
    drawField("Linhas de Ônibus:", form.endereco?.linhasOnibus);
    drawField("Valor VT:", form.endereco?.valorVT);

    // Linha separadora
    doc.line(10, startY - 2, 200, startY - 2);
    startY += 4;

    // --- SEÇÃO 5: INFORMAÇÕES DO PAI ---
    drawSectionHeader("4 - INFORMAÇÕES DO PAI");

    drawField("Nome do Pai:", form.pai?.nome);
    drawField("Telefone:", form.pai?.telefone);
    drawField("E-mail:", form.pai?.email);
    drawField("RG:", form.pai?.rg);
    drawField("CPF:", form.pai?.cpf);
    drawField("Profissão:", form.pai?.profissao);
    drawField("Desempregado:", form.pai?.desempregado);

    // Linha separadora
    doc.line(10, startY - 2, 200, startY - 2);
    startY += 4;

    // --- SEÇÃO 6: INFORMAÇÕES DA MÃE ---
    drawSectionHeader("5 - INFORMAÇÕES DA MÃE");

    drawField("Nome da Mãe:", form.mae?.nome);
    drawField("Telefone:", form.mae?.telefone);
    drawField("E-mail:", form.mae?.email);
    drawField("RG:", form.mae?.rg);
    drawField("CPF:", form.mae?.cpf);
    drawField("Profissão:", form.mae?.profissao);
    drawField("Desempregada:", form.mae?.desempregada);

    // Indicações
    doc.line(10, startY - 2, 200, startY - 2);
    startY += 4;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(secondaryColor);
    doc.text("Referência de Indicação:", 15, startY);
    startY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    drawField("Funcionário Indicando:", form.funcionarioIndicando);
    drawField("Telefone do Funcionário:", form.telefoneFuncionario);
    drawField("Parentesco:", form.parentesco);

    // Linha separadora
    doc.line(10, startY - 2, 200, startY - 2);
    startY += 4;

    // --- Declaração e Assinaturas (PÁGINA 2 ou 3) ---
    checkPageBreak(50);

    doc.setFont("helvetica", "bold");
    doc.text("Declaro a veracidade das informações acima declaradas.", 15, startY);

    startY += lineHeight;
    const declaracao =
        "Estou ciente que este é um benefício da empresa e que posso utilizar durante todo o período vigente do meu contrato de trabalho para a prática de Karatê.";

    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(declaracao, 180);
    doc.text(lines, 15, startY);

    startY += lines.length * (lineHeight - 1.5);
    doc.text(`Diadema, ${formatarData(form.dataDeclaracao)}`, 15, startY + 6);

    // --- Assinaturas ---
    startY += 25;
    const imgWidth = 50;
    const imgHeight = 20;
    const imgYOffset = -15;

    // 1. Assinatura do Aluno/Responsável (Chave que você confirmou)
    checkPageBreak(30);

    // Verifica e adiciona a assinatura do Canvas
    if (assinaturas["Aluno(a)/Responsável"]) {
        doc.addImage(assinaturas["Aluno(a)/Responsável"], "PNG", 15, startY + imgYOffset, imgWidth, imgHeight);
    }

    doc.setFont("helvetica", "bold");
    doc.text("____________________________________", 15, startY);
    doc.setFont("helvetica", "normal");
    doc.text("ASSINATURA ALUNO (A)/RESPONSÁVEL", 15, startY + 4);

    // // 2. Assinatura do Sensei/Professor (Exemplo)
    // const assinaturaProfKey = "Sensei/Professor";
    // if (assinaturas[assinaturaProfKey]) {
    //     doc.addImage(assinaturas[assinaturaProfKey], 'PNG', 110, startY + imgYOffset, imgWidth, imgHeight);
    // }
    doc.setFont("helvetica", "bold");
    doc.text("____________________________________", 110, startY);
    doc.setFont("helvetica", "normal");
    doc.text("ASSINATURA SENSEI/PROFESSOR", 110, startY + 4);


    return doc;
}