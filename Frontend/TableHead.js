const TableHead = ({columns, handleClickAll}) => {
    return ( 
        <thead className="table-row-head">
            <tr>
                <th className="p-2"><input onClick={handleClickAll} type="checkbox" name="all" id="all" /></th>
                {columns.map((column) => (
                    <th key={column} className="p-2">{column}</th>
                ))}
            </tr>
        </thead>
     );
}
 
export default TableHead