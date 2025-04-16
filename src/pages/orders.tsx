import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
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

interface OrderRow {
  id: number | string;
  displayText: string;
  amount: number;
  isMistake: string | null;
  employee: string;
  enteredOn: string;
}

export const Orders = () => {
  const { theme } = useTheme();
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
  const [totalAmount, setTotalAmount] = useState(0);

  const isAdmin = localStorage.getItem("isAdmin") || false;

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
    // {
    //   field: "employee",
    //   headerName: "Puntori",
    //   flex: 1,
    //   headerAlign: "center",
    //   align: "center",
    //   minWidth: 100,
    // },
    {
      field: "enteredOn",
      headerName: "Koha e regjistrimit",
      flex: 2,
      headerAlign: "center",
      align: "center",
      minWidth: 150,
    },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      const isAdmin = localStorage.getItem("isAdmin");
      const employeeId = localStorage.getItem("userID");
      if (isAdmin == "true" && user.userId === 0) {
        return;
      }
      const userId = isAdmin == "true" ? user.userId : employeeId;
      const orderList = await handleGet(
        `api/Payment/GetByEmployee?employeeId=${userId}`
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

        const newTotalAmount = rowsWithId.reduce(
          (acc: number, curr: any) => acc + curr.amount,
          0
        );

        setTotalAmount(newTotalAmount); // ✅ update totalAmount state

        const totalRow: OrderRow = {
          id: "",
          displayText: "TOTAL",
          amount: newTotalAmount,
          isMistake: "",
          employee: "",
          enteredOn: "",
        };

        setRows([...rowsWithId, totalRow]);
      }
    };

    const fetchUsers = async () => {
      // to change ---
      // const response = await handleGet(`api/GetStandartActive`);
      const response = await handleGet(`api/Users`);
      if (response.isSuccessfull) setUsers(response.data);
      else toast.error(response.errorMessage);
    };

    if (isAdmin == "true") fetchUsers();
    fetchOrders();
  }, [user.userId]);

  const getRowClassName = (params: any) => {
    return params.row.id === "" ? "total-row" : "";
  };

  const handleEmployeeOrder = async () => {
    if (isAdmin == "false") return;
    const response = await handleDelete(
      `api/Payment/ConfirmByEmployee?employeeId=${user.userId}`
    );
    if (response.isSuccessfull) {
      toast.success(`Ju jeni barazuar me puntorin "${user.username}"`);
      setTimeout(() => {
        window.location.reload();
      }, 1750);
    } else {
      toast.error(response.errorMessage);
    }
  };

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
  }, [user.userId, totalAmount]);

  console.log(rows);

  return (
    <div className="main_container">
      <ToastContainer />
      <div className="dark_theme_container">
        <MainHeader extra={"Home"} />
      </div>

      {isAdmin == "true" ? (
        <Paper
          sx={{
            height: "calc(100vh - 180px)",
            width: "100%",
            marginTop: "64px",
          }}
        >
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
              disabled={!user?.userId || totalAmount <= 0}
              onClick={() => setModalShow("barazo")}
            >
              Barazo
            </ButtonComponent>
          </div>

          {rows.length <= 1 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <Typography variant="body1" color="textSecondary">
                {user.userId === 0
                  ? "Zgjedhni puntorin qe ti shihni te dhenat !"
                  : `Ska te dhena per puntorin "${user.username}"`}
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              sx={{ border: 0 }}
              getRowClassName={getRowClassName}
            />
          )}
        </Paper>
      ) : (
        <Paper
          sx={{
            height: "calc(100vh - 180px)",
            width: "100%",
            marginTop: "64px",
          }}
        >
          {rows.length <= 1 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <Typography variant="body1" color="textSecondary">
                Ska te dhena per puntorin
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              sx={{ border: 0 }}
              getRowClassName={getRowClassName}
            />
          )}
        </Paper>
      )}
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
