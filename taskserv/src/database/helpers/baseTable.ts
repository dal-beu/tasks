
export function baseTable(modelName: string, tableName: string, options?: { schema?: string, timestamps?: boolean }) {
    return {
        modelName: modelName,
        tableName: tableName,
        timestamps: options?.timestamps ?? true,
        freezeTableName: true,
    };
}
