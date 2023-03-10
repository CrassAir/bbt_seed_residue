import * as React from 'react';
import MaterialTable, {Column} from "material-table";
import {useAppDispatch, useAppSelector} from "../hooks";
import {useEffect, useMemo, useState} from "react";
import {createIncoming, deleteIncoming, updateIncoming} from "../store/actions/seeds";
import {Box, TextField} from "@mui/material";
import {IIncoming} from "../models/ISeeds";
import {convertListToObject, localizationMT} from '../utils';
import {LocalizationProvider} from '@mui/x-date-pickers-pro';
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {ru} from "date-fns/locale";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import moment from "moment/moment";
import ExpenseTable from "./ExpenseTable";


export default function SeedsTable() {
    const dispatch = useAppDispatch()
    const {seeds, provider, country_origin, incoming, units} = useAppSelector(state => state.seedsReducer)
    const [data, setData] = useState<IIncoming[]>([])

    const columns = useMemo<Column<IIncoming>[]>(() => ([
            {
                title: 'Номер партии', field: 'part_number',
                validate: rowData => !!rowData.part_number,
                cellStyle: {minWidth: '150px'},
            }, {
                title: 'Дата поставки', field: 'date_time', type: 'date', cellStyle: {minWidth: '150px'},
                validate: rowData => !!rowData.date_time,
                editComponent: props => (
                    <LocalizationProvider adapterLocale={ru} dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label={'дд.мм.гггг'}
                            value={props.value || null}
                            onChange={props.onChange}
                            renderInput={(params: any) => <TextField {...params}/>}
                        />
                    </LocalizationProvider>
                )
            }, {
                title: 'Семена', field: 'seed',
                validate: rowData => !!rowData.part_number,
                lookup: seeds && convertListToObject(seeds),
                cellStyle: {minWidth: '250px'},
            }, {
                title: 'Год урожая', field: 'crop_year',
            }, {
                title: 'Поставщик', field: 'provider',
                lookup: provider && convertListToObject(provider),
            }, {
                title: 'Страна производитель', field: 'country_origin',
                lookup: country_origin && convertListToObject(country_origin),
            }, {
                title: 'Ед. измерения', field: 'unit',
                validate: rowData => !!rowData.unit,
                lookup: units && convertListToObject(units),
            }, {
                title: 'Количество', field: 'amount', type: 'numeric', align: 'center',
                validate: rowData => !!rowData.amount,
            }, {
                title: 'Остаток', field: 'real_balance', type: 'numeric', align: 'center',
                editable: 'never',
            }, {
                title: 'Страховой остаток', field: 'gift', type: 'numeric', align: 'center',
            }, {
                title: 'Пакет вскрыт', field: 'package_opened', type: 'boolean', align: 'center',
            }, {
                title: 'Комментарий', field: 'comment', cellStyle: {minWidth: '250px'},
                editComponent: ({value, onChange}) => (
                    <TextField value={value} onChange={e => onChange(e.target.value)}
                               inputProps={{sx: {fontSize: '13px'}}}
                               sx={{minWidth: 250}} multiline maxRows={4}/>
                )

            },

        ]),
        [seeds, country_origin, provider, units]
    )

    const options: any = useMemo(() => ({
        pageSize: 10,
        draggable: false,
        addRowPosition: 'first',
        // rowStyle: (rowData: IIncoming) => colorCell[rowData.general_state]
    }), [data])

    useEffect(() => {
        if (incoming) setData(incoming.map(value => ({...value, tableData: {}})))
    }, [incoming])

    return (
        <Box>
            <MaterialTable
                title={'Поставки семян'}
                options={options}
                localization={localizationMT}
                columns={columns.map((c) => ({...c, tableData: undefined}))}
                data={data}
                detailPanel={rowData => {
                    return <ExpenseTable incoming={rowData.id} unit_name={rowData.unit_name}/>
                }}
                // actions={actions}
                editable={{
                    onRowAdd: newData => {
                        newData.date_time = moment(newData.date_time).format('YYYY-MM-DD')
                        return dispatch(createIncoming(newData))
                    },
                    onRowUpdate: (newData) => {
                        newData.date_time = moment(newData.date_time).format('YYYY-MM-DD')
                        return dispatch(updateIncoming(newData))
                    },
                    onRowDelete: oldData => dispatch(deleteIncoming(oldData.id))
                }}
            />
        </Box>
    );
}