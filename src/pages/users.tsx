import { lazy, useEffect, useMemo, useState } from "react";
import { useTheme } from "../utilities/theme";
import { MainHeader } from "./mainHeader";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Paper } from "@mui/material";
import { ButtonComponent } from "../utilities/buttons";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { handleDelete, handleGet, handlePost, handlePut } from "../utilities/handleApiCalls";
import { CirclePlus, CircleX, Key, SquarePen } from "lucide-react";
import ModalFormMain from "../utilities/modalFormMain";

export const Users = (props: any) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [modalShow, setModalShow]=useState<("" | "status" | "password" | "delete" | "newUser")>("")
  const [userDetails, setUserDetails] = useState <({userId:number, username:string, isActive:boolean, isAdmin:boolean})>
  ({ userId: 0,
    username: "",
    isActive: false,
    isAdmin:false
  })
  const [users, setUsers] = useState<
    { userId: number; username: string; isActive: boolean, isAdmin: boolean }[]
  >([]);

    const [newUser, setNewUser] = useState<{ username: string; password: string; role:string }>({
    username: '',
    password: '',
    role:''
  });
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const isAdmin = localStorage.getItem("isAdmin") || false;

  useEffect(() => {
    if (isAdmin=="false") {
      navigate("/home");
    }
    const fetchUsers = async () => {
      const response = await handleGet(`api/Users`);
      if (response.isSuccessfull){
          setUsers(response.data);
      }
      else {
        navigate("/login")
      }
    };
    fetchUsers();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "username",
      headerName: "Username",
      flex: 2,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
    },
    {
      field: "isAdmin",
      headerName: "Admin",
      flex: 2,
      type: "boolean",
      headerAlign: "center",
      align: "center",
      minWidth: 100,
    },
    {
      field: "isActive",
      headerName: "Aktiv",
      type: "boolean",
      flex: 1,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
    },
    {
      field: "veprimet",
      headerName: "Veprimet",
      flex: 1,
      headerAlign: "center",
      align: "right",
      minWidth: 300,
      renderCell(params) {
          return (
            <div
              style={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <ButtonComponent
                color="primary"
                variant="outlined"
                size="small"
                style={{ fontSize: "10px", height: "35px", width: "112px" }}
                startIcon={<SquarePen />}
                onClick={() => {
                  setModalShow("status");
                  setUserDetails(params.row);
                }}
              >
                {params.row.isActive ? "Deaktivizo" : " Aktivizo"}
              </ButtonComponent>
              <ButtonComponent
                color="primary"
                variant="outlined"
                size="small"
                style={{ fontSize: "10px", height: "35px" }}
                startIcon={<Key />}
                onClick={() => {
                  setModalShow("password");
                  setUserDetails(params.row);
                }}
              >
                Reseto
              </ButtonComponent>
              <ButtonComponent
                color="warning"
                variant="outlined"
                size="small"
                style={{ fontSize: "10px", height: "35px" }}
                startIcon={<CircleX />}
                onClick={() => {
                  setModalShow("delete");
                  setUserDetails(params.row);
                }}
              >
                Fshi
              </ButtonComponent>
            </div>
          );
      },
    },
  ];

  const handleChangeStatus = async () => {
    if (userDetails.userId){
      const response = await handlePut(
        `api/Users/UpdateStatus?userId=${
          userDetails.userId
        }&isActive=${!userDetails.isActive}&isAdmin=${userDetails.isAdmin}`
      );
      if (response.isSuccessfull){
        toast.success(
          `Ju keni ${userDetails.isActive ? "deaktivizuar" : "aktivizuar"} perdoruesin ${userDetails.username}!`
        );
        setTimeout(()=>{
          window.location.reload()
        },1750)
      }
      else {
        toast.error(response.errorMessage)
      }
    }
  }

  const handleResetPassword = async () =>{ 
    if (userDetails.userId){
      const response = await handlePut(
        `api/Users/SetDefaultPassword?userId=${userDetails.userId}`
      );
      if (response.isSuccessfull){
        toast.success(
          `Ju keni resetuar password per perdoruesin "${userDetails.username}"!`
        );
        setTimeout(()=>{
          window.location.reload()
        },1750)
      }
      else {
        toast.error(response.errorMessage)
      }
    }
  }

  const handleDeleteUser = async () =>{ 
    if (userDetails.userId){
      const response = await handleDelete(
        `api/Users/Remove?userId=${userDetails.userId}`
      );
      if (response.isSuccessfull){
        toast.success(
          `Ju keni fshire  perdoruesin ${userDetails.username}!`
        );
        setTimeout(()=>{
          window.location.reload()
        },1750)
      }
      else {
        toast.error(response.errorMessage)
      }
    }
  }

  
  const handleNewUser = async () =>{ 
    if (newUser.username && newUser.password) {
      const role = newUser.role === "admin" ? "true" : "false";
      const response = await handlePost(
        `api/Register?username=${newUser.username}&password=${newUser.password}&isAdmin=${role}`
      );
      if (response.isSuccessfull) {
        toast.success(
          `Ju keni registruar  perdoruesin ${newUser.username}!`
        );
        setTimeout(() => {
          window.location.reload();
        }, 1750);
      } else {
        toast.error(response.errorMessage);
      }
    }
  }

  const resetPasswordFields = useMemo(() => {
      return [
        {
          type: "title" as const,
          label: `A deshironi te resetoni passwordin per perdoruesin "${userDetails.username}" ? `,

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
                onClick: handleResetPassword,
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
    }, [userDetails.userId]);

    const deleteUserFields = useMemo(() => {
      return [
        {
          type: "title" as const,
          label: `A deshironi te fshini perdoruesin "${userDetails.username}" ? `,

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
                onClick: handleDeleteUser,
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
    }, [userDetails.userId]);
    

    const changeStatusFields = useMemo(() => {
      return [
        {
          type: "title" as const,
          label: `A deshironi te ${
            userDetails.isActive ? "deaktivizoni" : "aktivizoni"
          } perdoruesin "${userDetails.username}" ? `,

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
                onClick: handleChangeStatus,
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
    }, [userDetails.userId]);

    const roleTypes = [
      { label: "User", value: "user" },
      { label: "Admin", value: "admin" },
    ];

    const newUserFields = useMemo(() => {
      return [
        {
          type: "text" as const,
          label: "Useri",
          props: {
            value: newUser?.username,
            variant: "outlined",
            fullWidth: true,
            margin: "normal",
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setNewUser({ ...newUser, username: e.target.value}),
          },
        },
        {
          type: "text" as const,
          label: "Paswordi",
          props: {
            value: newUser?.password,
            variant: "outlined",
            fullWidth: true,
            margin: "normal",
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setNewUser({ ...newUser, password: e.target.value}),
          },
        },
        {
          type: "select" as const,
          label: "Roli",
          options: roleTypes,
          props: {
            value: newUser.role || "",
            onChange: (e: React.ChangeEvent<{ value: unknown }>) => {
              const value = e.target.value as string;
              const selected = roleTypes.find((t) => t.value === value);
              setNewUser({ ...newUser, role: selected?.value || "" });
            },
            variant: "outlined",
            fullWidth: true,
            margin: "normal",
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
                color: "success",
                onClick: handleNewUser,
              },
            },
            {
              type: "button" as const,
              label: "Mbyll",
              props: {
                variant: "outlined",
                color: "error",
                onClick: () => setModalShow(""),
              },
            },
          ],
        },
      ];
    }, [newUser]);

  return (
    <div className="main_container">
      <ToastContainer />
      <div className="dark_theme_container">
        <MainHeader extra={"Home"} />
      </div>
      <Paper
        sx={{ height: "calc(100vh - 180px)", width: "100%", marginTop: "64px" }}
      >
        <div
          style={{
            display: "flex",
            gap: "25px",
            alignItems: "center",
            justifyContent: "end",
            marginRight: "20px",
            marginBottom: "20px",
          }}
        >
          <ButtonComponent
            color="primary"
            variant="outlined"
            size="small"
            style={{ fontSize: "10px", height: "35px" }}
            startIcon={<CirclePlus />}
            onClick={() => setModalShow("newUser")}
          >
            Shto User
          </ButtonComponent>
        </div>

        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.userId}
          sx={{ border: 0 }}
        />
      </Paper>

      {modalShow === "status" && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain
            fieldConfig={changeStatusFields}
            onClose={() => setModalShow("")}
            zIndex={20}
            theme={theme}
          />
        </div>
      )}

      {modalShow === "password" && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain
            fieldConfig={resetPasswordFields}
            onClose={() => setModalShow("")}
            zIndex={20}
            theme={theme}
          />
        </div>
      )}

      {modalShow === "delete" && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain
            fieldConfig={deleteUserFields}
            onClose={() => setModalShow("")}
            zIndex={20}
            theme={theme}
          />
        </div>
      )}

      {modalShow === "newUser" && (
              <div style={{ position: "relative", zIndex: 20 }}>
                <ModalFormMain
                  fieldConfig={newUserFields}
                  onClose={() => setModalShow("")}
                  zIndex={20}
                  theme={theme}
                />
              </div>
            )}

    </div>
  );
};
