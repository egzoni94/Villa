import { Eye, House, Key, LogOutIcon } from "lucide-react";
import { ButtonComponent } from "../utilities/buttons"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect, useMemo, useState } from "react";
import ModalFormMain from "../utilities/modalFormMain";
import { useTheme } from "../utilities/theme";
import { handlePut } from "../utilities/handleApiCalls";

export const MainHeader = (props:any) => {
  const extra=props?.extra
  const navigate = useNavigate();
  const [modalType, setModalType] = useState<"" | "changePassword">("");

  // const [openRoomDetails, setOpenRoomDetails] = useState({actualRoomMovementId: {}, newRoomNo: {}, newRoomTitle: {}});
  const userId = localStorage.getItem("userId") || "7";
  const [userData, setUserData] = useState({
    userId,
    oldPassword: "",
    password: "",
  });
  const { theme } = useTheme();
  const handleChangePassword = async () => {
    if (!userData.userId) return;
    if (!userData.oldPassword){
        toast.error("Shenoni passwordin e vjeter!")
        return;
    }

    if (!userData.password){
        toast.error("Shenoni passwordin e ri!")
        return;
    }
    
    const response = await handlePut(
      `api/ChangePassword?userId=7&oldPassword=${userData.oldPassword}&password=${userData.password}`
    );

    if (response.isSuccessfull) {
        toast.success("Fjalekalimi u ndryshua me sukses!");
        setUserData({userId, oldPassword: "", password: ""});
        setModalType("");
    } else {
        toast.error(response.errorMessage);
        setUserData({userId, oldPassword: "", password: ""});
        setModalType("");
    }
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const passwordFields = useMemo(() => {
    return [
      {
        type: "title" as const,
        label: "NDRYSHO FJALEKALIMIN",
        props:{}
      },
      {
        type: "text" as const,
        label: "Old Password",
        props: {
          value: userData.oldPassword || "",
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setUserData({ ...userData, oldPassword: e.target.value }),
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
        },
      },
      {
        type: "text" as const,
        label: "New Password",
        props: {
          value: userData.password || "",
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setUserData({ ...userData, password: e.target.value }),
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
              onClick: handleChangePassword,
            },
          },
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "outlined",
              color: "error",
              onClick: () => setModalType(""),
            },
          },
        ],
      },
    ];
  }, [userData]);
  console.log(props)
  return (
    <>
      {modalType === "changePassword" && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain
            fieldConfig={passwordFields}
            onClose={() => setModalType("")}
            zIndex={20}
            theme={theme}
          />
        </div>
      )}
      {extra && (
        <ButtonComponent
          color="primary"
          variant="outlined"
          size="small"
          style={{ fontSize: "10px" }}
          startIcon={<House size={15} />}
          onClick={() => navigate("/")}
        >
          Home
        </ButtonComponent>
      )}
      <ButtonComponent
        color="primary"
        variant="outlined"
        size="small"
        style={{ fontSize: "10px" }}
        startIcon={<Eye size={15} />}
      >
        Stoku
      </ButtonComponent>

      <ButtonComponent
        color="secondary"
        variant="outlined"
        size="small"
        style={{ fontSize: "10px" }}
        startIcon={<Eye size={15} />}
        onClick={() => navigate("/orders")}
      >
        Shiko Pazarin
      </ButtonComponent>

      <ButtonComponent
        color="secondary"
        variant="outlined"
        size="small"
        style={{ fontSize: "10px" }}
        startIcon={<Key size={15} />}
        onClick={() => setModalType("changePassword")}
      >
        Ndrysho fjalekalimin
      </ButtonComponent>

      <ButtonComponent
        color="warning"
        variant="outlined"
        size="small"
        style={{ fontSize: "10px" }}
        startIcon={<LogOutIcon size={15} />}
        onClick={() => {
          localStorage.clear();
          navigate("/login");
          setTimeout(() => {
            toast.success("Jeni çkyçur me sukses!");
          }, 1750);
        }}
      >
        Dil
      </ButtonComponent>
    </>
  );
};