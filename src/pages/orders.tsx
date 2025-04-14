import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "../utilities/theme";
import { MainHeader } from "./mainHeader";
import { handleDelete, handleGet } from "../utilities/handleApiCalls";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { formatDateTime } from "../utilities/utils";
import { ButtonComponent } from "../utilities/buttons";
import ModalFormMain from "../utilities/modalFormMain";
import { useNavigate } from "react-router-dom";

interface OrderRow {
  id: number | string;
  displayText: string;
  amount: number;
  isMistake: string | null;
  employee: string;
  enteredOn: string;
}

export const Orders = () => {
  const { toggleTheme, theme } = useTheme();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [users, setUsers] = useState<
    { userId: number; username: string; isActive: boolean }[]
  >([]);
  const [user, setUser] = useState({
    userId: 0,
    username: "",
    isActive: false,
  });
  const [modalShow, setModalShow] = useState<"" | "barazo">("");


  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      headerAlign: "center",
      align: "center",
      minWidth: 50,
    },
    {
      field: "displayText",
      headerName: "Item",
      flex: 2,
      headerAlign: "center",
      align: "left",
      minWidth: 300,
    },
    {
      field: "amount",
      headerName: "Shuma",
      type: "number",
      flex: 1,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
    },
    {
      field: "isMistake",
      headerName: "Gabim",
      type: "string",
      flex: 1,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
      valueGetter: (params: any) => {
        if (params == "") return "";
        return params;
      },
    },
    {
      field: "employee",
      headerName: "Puntori",
      flex: 1,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
    },
    {
      field: "enteredOn",
      headerName: "Koha e regjistrimit",
      flex: 2,
      headerAlign: "center",
      align: "center",
      minWidth: 150,
    },
  ];

  let totalAmount = 0;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const employeeId = localStorage.getItem("userId") || "2";
      const orderList = await handleGet(
        `api/Payment/GetByEmployee?employeeId=${employeeId}`
      );

      if (orderList.data) {
        const rowsWithId = orderList.data.map((item: any, index: number) => ({
          id: index + 1,
          displayText: item.displayText,
          amount: item.amount,
          isMistake: item.isMistake === "-" ? "" : item.isMistake ? "Po" : "Jo",
          employee: item.employee,
          enteredOn: formatDateTime(item.enteredOn),
        }));

        totalAmount = rowsWithId.reduce(
          (acc: number, curr: any) => acc + curr.amount,
          0
        );
        const totalRow: OrderRow = {
          id: "",
          displayText: "TOTAL",
          amount: totalAmount,
          isMistake: "",
          employee: "",
          enteredOn: "",
        };
        setRows([...rowsWithId, totalRow]);
      }
    };
    const fetchUsers = async () => {
      const response = await handleGet(`api/Users`);
      setUsers(response.data);
    };
    if (isAdmin) fetchUsers();

    fetchOrders();
  }, [user.userId]);

  const getRowClassName = (params: any) => {
    return params.row.id === "" ? "total-row" : "";
  };

  const isAdmin = localStorage.getItem("isAdmin") || true;
  
  const handleEmployeeOrder = async () => {
    if (!isAdmin) return;
    const response = await handleDelete(
      `api/Payment/ConfirmByEmployee?employeeId=${user.userId}`
    );
    if (response.isSuccessfull){
      toast.success(`Ju jeni barazuar me puntorin "${user.username}"`);
      setTimeout(()=>{
        navigate("/orders")
      },1750)
    }
    else {
        toast.error(response.errorMessage)
    }
  }

  const orderFieldConfig = useMemo(() => {
    if (!user.userId) return [];
    return [
      {
        type: "title" as const,
        label: `A doni te barazoni ${user.username} i cili ka ${totalAmount} Euro ? `,
        props: {
          variant: "contained",
          color: "primary",
        },
      },
      {
        type: "group" as const,
        fields: [
          {
            type: "button" as const,
            label: "Konfirmo",
            props: {
              variant: "outlined",
              color: "primary",
              onClick: handleEmployeeOrder,
            },
          },
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "outlined",
              color: "primary",
              onClick: () => setModalShow(""),
            },
          },
        ],
      },
    ];
  }, [user.userId]);

  return (
    <div className="main_container">
      <ToastContainer />
      <div className="dark_theme_container">
        <FormControlLabel
          control={<Switch checked={theme === "dark"} onChange={toggleTheme} />}
          label=""
        />
        <MainHeader extra={"Home"}/>
      </div>

      <Paper
        sx={{ height: "calc(100vh - 180px)", width: "100%", marginTop: "64px" }}
      >
        {isAdmin && (
          <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
            <FormControl
              fullWidth
              style={{
                width: "200px",
                marginLeft: "20px",
              }}
            >
              <InputLabel>Puntori </InputLabel>
              <Select
                onChange={(e) => {
                  const selectedUser = users.find(
                    (user) => user.userId === Number(e.target.value)
                  );
                  if (selectedUser) {
                    setUser(selectedUser);
                  }
                }}
                value={user.userId !== 0 ? String(user.userId) : ""}
              >
                {users.map((option, index) => (
                  <MenuItem key={index} value={option.userId}>
                    {option.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <ButtonComponent
              color="primary"
              variant="outlined"
              size="small"
              style={{ fontSize: "10px", height: "35px" }}
              onClick={() => setModalShow("barazo")}
            >
              Barazo
            </ButtonComponent>
          </div>
        )}

        <DataGrid
          rows={rows}
          columns={columns}
          sx={{ border: 0 }}
          getRowClassName={getRowClassName}
        />
      </Paper>
      {modalShow === "barazo" && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain
            fieldConfig={orderFieldConfig}
            onClose={() => setModalShow("")}
            zIndex={20}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
};
