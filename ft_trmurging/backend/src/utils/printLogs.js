function printLogsDate(target) {
    try {
    process.stdout.write(target);
    const date = new Date();
    const currentDate = date.toLocaleString();
    console.log(currentDate);
    } catch (error) {
        console.error("Error printing log date:", error);
        throw error;
    }
};

module.exports = printLogsDate;