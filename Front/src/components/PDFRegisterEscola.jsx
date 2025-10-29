import jsPDF from "jspdf";
import Logo from "../assets/Logo.png";

// Recebe form e o objeto assinaturas (ex: { aluno: 'base64...', gerente: 'base64...' })
export default function PDFRegister(form, assinaturas = {}, perfil) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const secondaryColor = "#4B4B4B";
    const lineColor = "#cccccc";
    const pageWidth = 210; // Largura do A4 em mm
    const pageHeight = 297; // Altura do A4 em mm
    const margin = 10;
    const maxContentHeight = pageHeight - (margin * 2);

    const formatarData = (data) => {
        if (!data) return "__/__/____";
        const partes = data.split("-");
        if (partes.length !== 3) return data;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    };

    let startY = 50;
    const lineHeight = 6; // espaçamento compacto

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
        checkPageBreak(12); // Garante espaço para o cabeçalho e margem
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
    doc.text("FICHA DE INSCRIÇÃO - ESCOLA DIGITAL", pageWidth / 2, 34, { align: "center" });
    startY = 50;

    // --- SEÇÃO 1: DADOS PESSOAIS DO ALUNO (A) ---
    drawSectionHeader("1 - DADOS PESSOAIS DO ALUNO (A)");

    drawField("Nome Completo:", form.nome);
    drawField("Data de Nascimento:", formatarData(form.nascimento));
    drawField("E-mail:", form.email);
    drawField("Telefone/Celular:", form.telefone);
    drawField("CPF:", form.cpf);
    drawField("RG:", form.rg);
    drawField("Órgão Emissor:", form.emissor);
    drawField("Data Emissão:", formatarData(form.dataEmissor));
    drawField("Sexo:", form.sexo);
    drawField("Destro ou Canhoto:", form.destroCanhoto);
    drawField("Já Trabalhou?:", form.jaTrabalhou);
    drawField("Setor que trabalha:", form.setor);

    // --- Foto (Placeholder) ---
    checkPageBreak(25);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    if (perfil) { 
        doc.addImage(perfil, "PNG", 145, 52, 50, 50);
    } else {
        doc.rect(145, 52, 50, 50);
    }

    // Linha separadora
    doc.setDrawColor(lineColor);
    doc.setLineWidth(0.3);
    doc.line(10, startY - 2, 200, startY - 2);
    startY += 4;

    // --- SEÇÃO 2: ESCOLARIDADE ---
    drawSectionHeader("2 - ESCOLARIDADE");

    drawField("Escolaridade:", form.escolaridade);
    drawField("Período:", form.periodo);
    drawField("Série/Ano:", form.serie);
    drawField("Escola:", form.escola);

    // Linha separadora
    doc.line(10, startY - 2, 200, startY - 2);
    startY += 4;

    // --- SEÇÃO 3: SAÚDE (Checa quebra de página antes de começar) ---
    drawSectionHeader("3 - INFORMAÇÕES DE SAÚDE");

    drawField("Convênio:", form.convenio);
    drawField("Qual Convênio:", form.qualConvenio);
    drawField("Alergia a Medicamentos:", form.alergiaMedicamento);
    drawField("Qual Medicamento:", form.qualMedicamento);
    drawField("Alergia a Alimentos:", form.alergiaAlimento);
    drawField("Qual Alimento:", form.qualAlimento);
    drawField("Transtorno/Deficiência:", form.transtornoDetalhe);
    drawField("Tratamento de Saúde:", form.tratamentoSaudeDetalhe);
    drawField("CID:", form.cid);
    drawField("Laudo:", form.laudo);
    drawField("Acompanhamento médico:", form.acompanhamento);
    drawField("Medicamento de uso contínuo:", form.medicamento);
    drawField("Onde Levar quando passar mal: ", form.passarMal);

    // Linha separadora
    doc.line(10, startY - 2, 200, startY - 2);
    startY += 4;

    // --- PÁGINA 2 ---
    // Inicia nova página para garantir espaço para as próximas seções
    checkPageBreak(12);

    // --- SEÇÃO 4: ENDEREÇO E MORADIA ---
    drawSectionHeader("4 - ENDEREÇO E MORADIA");

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
    drawField("Cartão de Ônibus:", form.endereco?.cartaoOnibus);
    drawField("Situação da Moradia:", form.endereco?.moradia);
    drawField("Moradia Cedida (Detalhe):", form.endereco?.moradiaCedida);

    // Linha separadora
    doc.line(10, startY - 2, 200, startY - 2);
    startY += 4;

    // --- SEÇÃO 5: INFORMAÇÕES DO PAI ---
    drawSectionHeader("5 - INFORMAÇÕES DO PAI");

    drawField("Nome do Pai:", form.pai?.nome);
    drawField("Telefone:", form.pai?.telefone);
    drawField("E-mail:", form.pai?.email);
    drawField("Nascimento:", formatarData(form.pai?.nascimento));
    drawField("RG:", form.pai?.rg);
    drawField("CPF:", form.pai?.cpf);
    drawField("Profissão:", form.pai?.profissao);
    drawField("Desempregado:", form.pai?.desempregado);
    drawField("Média Salário:", form.pai?.mediaSalario);
    drawField("Falecido:", form.pai?.falecido);

    // Linha separadora
    doc.line(10, startY - 2, 200, startY - 2);
    startY += 4;

    // --- SEÇÃO 6: INFORMAÇÕES DA MÃE ---
    drawSectionHeader("6 - INFORMAÇÕES DA MÃE");

    drawField("Nome da Mãe:", form.mae?.nome);
    drawField("Telefone:", form.mae?.telefone);
    drawField("E-mail:", form.mae?.email);
    drawField("Nascimento:", formatarData(form.mae?.nascimento));
    drawField("RG:", form.mae?.rg);
    drawField("CPF:", form.mae?.cpf);
    drawField("Profissão:", form.mae?.profissao);
    drawField("Desempregada:", form.mae?.desempregada);
    drawField("Média Salário:", form.mae?.mediaSalario);
    drawField("Falecida:", form.mae?.falecida);

    // Linha separadora
    doc.line(10, startY - 2, 200, startY - 2);
    startY += 4;

    // --- SEÇÃO 7: OUTROS DADOS E INDICAÇÃO ---
    drawSectionHeader("7 - OUTRAS INFORMAÇÕES");

    drawField("Tem Filhos:", form.temFilhos);
    drawField("Quantos Filhos:", form.filhos);
    drawField("Recebe Benefício:", form.beneficio);
    drawField("Qual Benefício:", form.qualBeneficio);
    drawField("Valor Benefício:", form.valorBeneficio);

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

    // --- PÁGINA 3 ---
    checkPageBreak(30);

    // --- Declaração (Checa se precisa de nova página) ---
    doc.setFont("helvetica", "bold");
    doc.text("Declaro a veracidade das informações acima declaradas.", 15, startY);

    startY += lineHeight;
    const declaracao =
        "Estou ciente que este é um benefício da empresa e que posso utilizar durante todo o período vigente do meu contrato de trabalho.";

    // Quebra o texto longo em linhas
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(declaracao, 180);
    doc.text(lines, 15, startY);

    startY += lines.length * (lineHeight - 1.5);
    doc.text(`Diadema, ${formatarData(form.dataDeclaracao)}`, 15, startY + 6);

    // --- Assinaturas ---
    startY += 25;
    const assinaturaSpacing = 20;
    const imgWidth = 80;
    const imgHeight = 15;
    const imgYOffset = -15; // Coloca a imagem da assinatura um pouco acima da linha

    // 1. Assinatura do Aluno/Responsável (Campo obrigatório)
    if (assinaturas["Aluno(a)/Responsável"]) {
        doc.addImage(assinaturas["Aluno(a)/Responsável"], "PNG", 15, startY - 15, 50, 20);
    }
    doc.setFont("helvetica", "bold");
    doc.text("____________________________________", 15, startY);
    doc.setFont("helvetica", "normal");
    doc.text("ASSINATURA ALUNO (A)/RESPONSÁVEL", 15, startY + 4);

    // 2. Assinatura da Gerente
    // if (assinaturas.gerente) {
    //     doc.addImage(assinaturas.gerente, 'PNG', 110, startY + imgYOffset, imgWidth, imgHeight);
    // }
    doc.setFont("helvetica", "bold");
    doc.text("____________________________________", 110, startY);
    doc.setFont("helvetica", "normal");
    doc.text("ASSINATURA ESCOLA DIGITAL PARANOÁ", 110, startY + 4);
    doc.text("(Gerente Thaís Muller Xavier)", 110, startY + 8);

    // 3. Assinatura do Profissional Educacional
    startY += assinaturaSpacing;
    checkPageBreak(30);
    if (assinaturas.prof) {
        doc.addImage(assinaturas.prof, 'PNG', 15, startY + imgYOffset, imgWidth, imgHeight);
    }
    doc.setFont("helvetica", "bold");
    doc.text("____________________________________", 15, startY);
    doc.setFont("helvetica", "normal");
    doc.text("Profissional Educacional (Quezia Arruda)", 15, startY + 4);

    return doc;
}