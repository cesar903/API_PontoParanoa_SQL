import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import Logo from "../../public/Logo.png";


const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        padding: 30,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 0,
    },
    logo: {
        width: 200,
        height: 70,
    },
    titleContainer: {
        flex: 1,
        textAlign: "center",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 12,
    },
    infoSection: {
        fontSize: 12,
        marginTop: 50,
    },
    table: {
        display: "flex",
        width: "100%",
        border: "1px solid #000",
        marginTop: 20,
    },
    tableRow: {
        flexDirection: "row",
    },
    tableHeader: {
        backgroundColor: "#333",
        color: "white",
        fontWeight: "bold",
    },
    tableCell: {
        flex: 1,
        padding: 5,
        border: "1px solid #000",
        fontSize: 10,
        textAlign: "center",
    },
    rowEven: {
        backgroundColor: "#f0f0f0",
    },
    totalSection: {
        flexDirection: "row",
        justifyContent: "flex-end",
        fontWeight: "bold",
        marginTop: 20,
    },
    footer: {
        marginTop: 70,
        textAlign: "center",
    },
    signatureSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 50,
        marginTop: 100,
    },
    signatureLine: {
        borderTop: "1px solid black",
        width: "40%",
        textAlign: "center",
        fontSize: 10,
        paddingTop: 5,
    },
    observacaoSection: {
        marginTop: 30,
        padding: 10,
        border: "1px solid #000",
        fontSize: 12,
        textAlign: "left",
        backgroundColor: "#f9f9f9",
    },
    section: {
        marginTop: 20,
    },
});

const PDFReport = ({ aluno, registros, mes, ano, observacao, faltas, faltasJustificadas }) => {
    // Função para calcular a diferença de horas entre check-in e check-out
    const calcularHoras = (checkIn, checkOut) => {
        const [inHoras, inMinutos] = checkIn.split(":").map(Number);
        const [outHoras, outMinutos] = checkOut.split(":").map(Number);

        // Converter horários para minutos totais
        const minutosCheckIn = inHoras * 60 + inMinutos;
        const minutosCheckOut = outHoras * 60 + outMinutos;

        // Calcular diferença e converter para horas
        const diferencaMinutos = minutosCheckOut - minutosCheckIn;
        return diferencaMinutos / 60; // Retorna como número sem toFixed
    };

    // Filtrar os registros com base no mês e ano
    const registrosFiltrados = registros.filter((registro) => {
        const [dia, mesRegistro, anoRegistro] = registro.data.split("/").map(Number);
        return mesRegistro === mes && anoRegistro === ano;
    });

    // Calcular total de horas aprovadas
    const totalHoras = registrosFiltrados
        .filter(registro => registro.status === "aprovado") // Filtra apenas aprovados
        .reduce((acc, registro) => acc + calcularHoras(registro.checkIn, registro.checkOut), 0);


    const formatarHoras = (horasDecimais) => {
        const horas = Math.floor(horasDecimais); // Parte inteira (horas)
        const minutos = Math.round((horasDecimais - horas) * 60); // Converte a parte decimal para minutos
        return `${horas}h ${minutos}m`;
    };



    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerContainer}>
                    <Image src={Logo} style={styles.logo} />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Relatório de Horas Aprovadas</Text>
                        <Text style={styles.subtitle}>Referente a {mes.toString().padStart(2, "0")} / {ano}</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Text>Aluna: <Text style={{ fontWeight: "bold" }}>{aluno.nome}</Text></Text>
                    <Text>Email: <Text style={{ fontWeight: "bold" }}>{aluno.email}</Text></Text>
                    <Text>Faltas Justificadas:</Text>
                    <View>
                        {faltasJustificadas.map((falta, index) => (
                            <Text key={index} style={{ marginBottom: 2 }}>
                                {falta.data} - Motivo: {falta.motivo}
                            </Text>
                        ))}
                    </View>
                </View>

                <Table registros={registrosFiltrados} calcularHoras={calcularHoras} formatarHoras={formatarHoras} />


                <View style={styles.totalSection}>
                    <Text>Total de Faltas: <Text style={{ fontWeight: "bold" }}>{faltas.length}</Text></Text>
                </View>

                <View style={styles.totalSection}>
                    <Text>Total de horas: {formatarHoras(totalHoras)}</Text>
                </View>

                <View style={styles.observacaoSection}>
                    <Text style={{ fontWeight: "bold" }}>Observação:</Text>
                    <Text>{observacao || "Nenhuma observação adicionada."}</Text>
                </View>

                <View style={styles.signatureSection}>
                    <View style={styles.signatureLine}>
                        <Text>Assinatura do Aluno</Text>
                    </View>
                    <View style={styles.signatureLine}>
                        <Text>Assinatura do Instrutor</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

const Table = ({ registros, calcularHoras, formatarHoras }) => (
    <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Data</Text>
            <Text style={styles.tableCell}>Entrada</Text>
            <Text style={styles.tableCell}>Saída</Text>
            <Text style={styles.tableCell}>Aprovado</Text>
            <Text style={styles.tableCell}>Horas</Text>
        </View>
        {registros.map((registro, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : null]}>
                <Text style={styles.tableCell}>{registro.data}</Text>
                <Text style={styles.tableCell}>{registro.checkIn}</Text>
                <Text style={styles.tableCell}>{registro.checkOut}</Text>
                <Text style={styles.tableCell}>{registro.status}</Text>
                <Text style={styles.tableCell}>
                    {formatarHoras(calcularHoras(registro.checkIn, registro.checkOut))}
                </Text>
            </View>
        ))}
    </View>
);


export default PDFReport;