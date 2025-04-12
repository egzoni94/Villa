import { useEffect, useState, useMemo } from "react";
import { handleGet, handlePost, handlePut } from "../utilities/handleApiCalls";
import { useTheme } from "../utilities/theme";
import { FormControlLabel, Switch, Card } from "@mui/material";
import { House } from "lucide-react";
import ModalFormMain from "../utilities/modalFormMain";
import { Colors } from "../utilities/colors";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { isNumericInput } from "../utilities/utils";

export function HomePage() {
  type Room = {
    roomNo: string;
    roomType: string;
    roomMovementId: number;
    title: string;
    isOpen: boolean;
    isExtraRoomType: boolean;
    clientPlateNo?: string;
    clientDocument?: string;
    clientCarName?: string;
    startTime?: string;
    spendTime?: string;
    amountDebt?: number;
    isDebt: boolean;
    hours?: number;
    price?: number;
    roomModel: string;
    isCustom?: boolean;
  };

  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [roomTypes, setRoomTypes] = useState<{ value: string; label: string; price?: number; hours?: number; isCustom?: boolean }[]>([]);
  const { toggleTheme, theme } = useTheme();
  const [modalType, setModalType] = useState<"" | "new" | "details" | "extraDetails" | "continue" | "confirmPayment" | "mistake" | "change">("");
  const [openRooms, setOpenRooms] = useState<{ value: string; label: string }[]>([]);
  const [openRoomDetails, setOpenRoomDetails] = useState({actualRoomMovementId: {}, newRoomNo: {}, newRoomTitle: {}});
  const [continueRoomDetails, setContinueRoomDetails] = useState<{
    hours: number;
    price: number;
    isDebt: boolean;
    roomType: string;
    roomMovementId: number;
  }>({
    hours: 0,
    price: 0,
    isDebt: false,
    roomType: "",
    roomMovementId: 0
  });

  const [extraRoomTypes, setExtraRoomTypes] = useState<{ value: string; label: string; price?: number; hours?: number; isCustom?: boolean, isDebt?:boolean }[]>([]);
  const [extraRoomDetails, setExtraRoomDetails] = useState<{
    hours: number;
    price: number;
    isDebt: boolean;
    roomType: string;
    roomMovementId: number;
    isCustom?: boolean; // Add isCustom field here
    clientCarName?: string;
    clientDocument?: string;
    clientPlateNo?:string;
    roomTitle?:string;
    roomTypeDescription?:string;
    spendTime?:string;
    startTime?:string;
    total?:number;
    roomAmount?:number;
    roomDebt?: number;
    gratisAmount?: number,
    marketAmount?: number,
    marketDebt?: number,
    extras?:string

  }>({
    hours: 0,
    price: 0,
    isDebt: false,
    roomType: "",
    roomMovementId: 0,
    clientCarName: "",
    clientDocument: "",
    clientPlateNo: "",
    roomTitle: "",
    roomTypeDescription:"",
    spendTime:"",
    startTime:"",
    total:0,
    roomAmount:0,
    roomDebt:0,
    gratisAmount:0,
    marketAmount:0,
    marketDebt:0,
    extras:""
  }); 
  const [paymentMessage, setPaymentMessage] = useState<{ data: string } | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await handleGet("api/Room/GetRooms");
        if (response.isSuccessfull) {
          setAllRooms(response.data as Room[]);
        }
        if (response.error){
          localStorage.setItem("access_token","");
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };
    fetchRooms();
  }, [navigate]);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleRoomClick = async (room: Room) => {
    const body = { ...room, isDebt: true };
    setActiveRoom(body);
    if (room.isOpen){
      const detailsRoomResponse = await handleGet(
        `api/Room/GetRoomDetails?roomMovementId=${room.roomMovementId}`
      );
      if (detailsRoomResponse.isSuccessfull) {
        setExtraRoomDetails(detailsRoomResponse.data);
      }

      setModalType("details");
    } 
    if (!room.isOpen) {
      const res = await handleGet(`api/RoomType/GetBasic?roomModel=${room.roomModel}`);
      if (res.isSuccessfull) {
        setRoomTypes(
          res.data.map((type: any) => ({
            value: type.code,
            label: type.description,
            hours: type.hours,
            isCustom: type.isCustom,
            price: type.price,
          }))
        );
      }
      setModalType("new");
    } 
  };

  const handleOpenRoom = async () => {
    if (!activeRoom) return;
    const body = {
      clientCarName: activeRoom.clientCarName,
      clientDocument: activeRoom.clientDocument,
      clientPlateNo: activeRoom.clientPlateNo,
      roomNo: activeRoom.roomNo,
      roomType: activeRoom.roomType,
      isDebt: activeRoom.isDebt,
      price: activeRoom.price,
      hours: activeRoom.hours,
    };
    const res = await handlePost("api/Room/Openroom", body);
    if (res.isSuccessfull) {
      toast.success("Dhoma u hap!");
      setTimeout(() =>{
        setModalType("")
        window.location.reload()
      }
      , 1750);
    } else {
      toast.error(res.errorMessage);
    }
  };
   
  const updateRoomField = (field: keyof Room, value: any) => {
    if (!activeRoom) return;
    setActiveRoom((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleContinueRoom = async() => {
    if (!activeRoom) return;
    const detailResponse = await handleGet(`api/RoomType/GetExtras?roomModel=${activeRoom?.roomModel}`)
    if (detailResponse.isSuccessfull) {
      setExtraRoomTypes(
        detailResponse.data.map((type: any) => ({
          value: type.code,
          label: type.description,
          hours: type.hours,
          isCustom: type.isCustom,
          price: type.price
        })))
    }
    setModalType("continue")
  }

  const handleAcceptContinueRoom = async () => {
    const body = {
      roomMovementId: activeRoom?.roomMovementId,
      roomType: continueRoomDetails?.roomType,
      isDebt: continueRoomDetails?.isDebt,
      hours: continueRoomDetails?.hours,
      price: continueRoomDetails?.price,
    };
    const extraRoomResponse = await handlePost(
      `api/Room/AddExtraInRoom`,
      body
    );
    if (extraRoomResponse.isSuccessfull) {
      toast.success("Dhoma u vazhdua!");
      setTimeout(() => {
        window.location.reload();
      },1750)
    }
  };

  const handleCloseRoom = async () => {
    setModalType("");
    if(!activeRoom) return;
    const handleCloseRoomResponse = await handlePut(
      `api/Room/CloseRoom?roomMovementId=${activeRoom?.roomMovementId}`
    );
    if (handleCloseRoomResponse.isSuccessfull) {
      toast.success("Dhoma u mbyll");
      setTimeout(() => {
        window.location.reload();
      },1750)
    }
  }

  const handlePaymentModal=async () => {
    if (!activeRoom) return;
    const paymentResponse = await handleGet(
      `api/Room/GetConfirmMessage?roomMovementId=${activeRoom?.roomMovementId}`
    );
    if (paymentResponse.isSuccessfull) {
      setPaymentMessage(paymentResponse)
      setModalType("confirmPayment")
    }
  }

  const handleAcceptPaymentRoom = async () => {
    if (!activeRoom) return;
    const response = await handlePut(
      `api/Room/ConfirmAllTheDebt?roomMovementId=${activeRoom?.roomMovementId}`
    );
    if (response.isSuccessfull) {
      toast.success(`Pagesa u perfundua me sukses per dhomen ${activeRoom?.title}`)
      setTimeout(()=>{
        window.location.reload();
      },1750)
    }
  }

  const handleMistakeModal = () => {
    setModalType("mistake");
  };

  const handleChangeRoom = async () => {
    if (!activeRoom) return 
    const availableRooms = await handleGet(`api/Room/GetAvailableRooms?roomModel=${activeRoom?.roomModel}`)
    if (!availableRooms?.data?.length) {
      toast.error("Nuk ka dhoma te lira ");
      setTimeout(()=>{
        window.location.reload();
      },1750)
    }
    setOpenRooms(
      availableRooms?.data.map((room : any) => ({
        value: room.roomNo,
        label: room.title,
      }))
    );

    setOpenRoomDetails({
      actualRoomMovementId: activeRoom?.roomMovementId,
      newRoomTitle: "",
      newRoomNo: "",
    });
    setModalType("change");
  };

  const handleAcceptMistakeRoom = async () => {
    if (!activeRoom) return;
    const response = await handlePut(`api/Room/Mistake?roomMovementId=${activeRoom.roomMovementId}`)
    if (response.isSuccessfull){
      toast.success("Dhoma u mbyll");
      setTimeout(()=>{
        window.location.reload();
      },1750)
    } else {
      toast.error(response?.errorMessage);
    }
  }

  const handleAcceptChangeRoom = async () => {
    if (!activeRoom) return;
    const response = await handlePut(`api/Room/ChangeRoom?roomMovementId=${openRoomDetails.actualRoomMovementId}&roomNo=${openRoomDetails.newRoomNo}`)
    if (response.isSuccessfull){
      toast.success(
        `Dhoma u ndrrua nga dhoma ${activeRoom.title} te ${openRoomDetails.newRoomTitle}`
      );
      setTimeout(()=>{
        window.location.reload();
      },1750)
    } else {
      toast.error(response?.errorMessage);
    }
  }


  const fieldConfig = useMemo(() => {
    if (!activeRoom) return [];
    const selectedType = roomTypes.find((type) => type.value === activeRoom.roomType);

    return [
      {
        type: "text" as const,
        label: "Tabela",
        props: {
          value: activeRoom.clientPlateNo || "",
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            updateRoomField("clientPlateNo", e.target.value),
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: activeRoom?.isOpen ? true : false,
        },
      },
      {
        type: "text" as const,
        label: "Vetura",
        props: {
          value: activeRoom.clientCarName || "",
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            updateRoomField("clientCarName", e.target.value),
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: activeRoom?.isOpen ? true : false,
        },
      },
      {
        type: "text" as const,
        label: "Dokument",
        props: {
          value: activeRoom.clientDocument || "",
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            updateRoomField("clientDocument", e.target.value),
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: activeRoom?.isOpen ? true : false,
        },
      },
      {
        type: "select" as const,
        label: "Modeli",
        options: roomTypes,
        props: {
          value: activeRoom.roomType || "",
          onChange: (e: React.ChangeEvent<{ value: unknown }>) => {
            const value = e.target.value as string;
            const selected = roomTypes.find((t) => t.value === value);
            updateRoomField("roomType", value);
            updateRoomField("price", selected?.price || 0);
            updateRoomField("hours", selected?.hours || 0);
          },
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: activeRoom?.isOpen ? true : false,
        },
      },
      {
        type: "text" as const,
        label: "Ore",
        props: {
          value: activeRoom?.hours || 0,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: !selectedType?.isCustom ? true : false,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setActiveRoom({ ...activeRoom, hours: Number(e.target.value) }),
        },
      },
      {
        type: "text" as const,
        label: "Qmimi",
        props: {
          value: activeRoom?.price || 0,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: !selectedType?.isCustom ? true : false,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setActiveRoom({ ...activeRoom, price: Number(e.target.value) }),
        },
      },
      {
        type: "checkbox" as const,
        label: "Pagoi",
        props: {
          checked: !activeRoom.isDebt,
          onChange: () => updateRoomField("isDebt", !activeRoom.isDebt),
          fullWidth: true,
          disabled: activeRoom?.isOpen ? true : false,
        },
      },
      {
        type: "group" as const,
        fields: [
          {
            type: "button" as const,
            label: "Hap",
            props: {
              variant: "contained",
              color: "primary",
              onClick: handleOpenRoom,
            },
          },
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "contained",
              color: "primary",
              onClick: () => handleCloseRoom,
            },
          },
         
        ],
      },
    ];
  }, [activeRoom, roomTypes]);

  const continueFieldConfig = useMemo(() => {
    if (!activeRoom) return [];
    return [
      {
        type: "select" as const,
        label: "Modeli",
        options: extraRoomTypes,
        props: {
          value: continueRoomDetails.roomType || "",
          onChange: (e: React.ChangeEvent<{ value: unknown }>) => {
            const value = e.target.value as string;
            const selected = extraRoomTypes.find((t) => t.value === value);
            setContinueRoomDetails({
              ...continueRoomDetails,
              roomType: value,
              price: selected?.price || 0,
              hours: selected?.hours || 0,
            });
          },
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
        },
      },
      {
        type: "text" as const,
        label: "Koha",
        props: {
          value: continueRoomDetails.hours || "",
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: continueRoomDetails.roomType === "T" ? false : true,
          onChange: (e: React.ChangeEvent<{ value: unknown }>) => {
            const value = e.target.value as string;
            if (isNumericInput(value)) {
              setContinueRoomDetails({
                ...continueRoomDetails,
                hours: Number(value),
              });
            }
          },
        },
      },
      {
        type: "text" as const,
        label: "Qmimi",
        props: {
          value: continueRoomDetails.price || "",
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: continueRoomDetails.roomType === "T" ? false : true,
          onChange: (e: React.ChangeEvent<{ value: unknown }>) => {
            const value = e.target.value as string;
            if (isNumericInput(value)) {
              setContinueRoomDetails({
                ...continueRoomDetails,
                price: Number(value),
              });
            }
          },
        },
      },
      {
        type: "checkbox" as const,
        label: "Pagoi",
        props: {
          checked: !continueRoomDetails.isDebt,
          onChange: () =>
            setContinueRoomDetails({
              ...continueRoomDetails,
              isDebt: !continueRoomDetails.isDebt,
            }),
          fullWidth: true,
        },
      },
      {
        type: "group" as const,
        fields: [
          {
            type: "button" as const,
            label: "Konfirmo",
            props: {
              variant: "contained",
              color: "primary",
              onClick: handleAcceptContinueRoom,
            },
          },
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "contained",
              color: "primary",
              onClick: () => setModalType(""),
            },
          },
        ],
      },
    ];
  }, [continueRoomDetails, extraRoomDetails, extraRoomTypes]);

  const detailsFieldConfig = useMemo(() => {
    let timeLimit = false;
    if (!extraRoomDetails) return [];
    if (extraRoomDetails.spendTime){
      const time = extraRoomDetails.spendTime.split(" - ");
      const [hour, minute] = time[1].split(":");
      if (Number(hour) < 1 && Number(minute) < 6) {
        timeLimit = true;
      }
    }
    if (!extraRoomDetails) return [];

    return [
      {
        type: "text" as const,
        label: "Dhoma",
        props: {
          value: extraRoomDetails.roomTitle,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: true,
        },
      },
      {
        type: "text" as const,
        label: "Tipi",
        props: {
          value: extraRoomDetails.roomTypeDescription,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: true,
        },
      },
      {
        type: "text" as const,
        label: "Tabela",
        props: {
          value: extraRoomDetails.clientPlateNo,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: true,
        },
      },
      {
        type: "text" as const,
        label: "Kerri",
        props: {
          value: extraRoomDetails.clientCarName,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: true,
        },
      },
      {
        type: "text" as const,
        label: "Dokumenti",
        props: {
          value: extraRoomDetails.clientDocument,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: true,
        },
      },
      
      ...(extraRoomDetails.startTime
        ? [
            {
              type: "text" as const,
              label: "Koha e Hyrjes",
              props: {
                value: extraRoomDetails.startTime,
                variant: "outlined",
                fullWidth: true,
                margin: "normal",
                disabled: true,
              },
            },
          ]
        : []),
        ...(extraRoomDetails.spendTime
          ? [
              {
                type: "text" as const,
                label: "Koha e kaluar",
                props: {
                  value: extraRoomDetails.spendTime,
                  variant: "outlined",
                  fullWidth: true,
                  margin: "normal",
                  disabled: true,
                },
              },
            ]
          : []),
      ...(extraRoomDetails.extras
        ? [
            {
              type: "text" as const,
              label: "Extra",
              props: {
                value: extraRoomDetails.extras,
                variant: "outlined",
                fullWidth: true,
                margin: "normal",
                disabled: true,
              },
            },
          ]
        : []),
      ...(extraRoomDetails.gratisAmount
        ? [
            {
              type: "text" as const,
              label: "Gratis",
              props: {
                value: extraRoomDetails.gratisAmount,
                variant: "outlined",
                fullWidth: true,
                margin: "normal",
                disabled: true,
              },
            },
          ]
        : []),
      ...(extraRoomDetails.marketAmount
        ? [
            {
              type: "text" as const,
              label: "Borxhi total market",
              props: {
                value: extraRoomDetails.marketAmount,
                variant: "outlined",
                fullWidth: true,
                margin: "normal",
                disabled: true,
              },
            },
          ]
        : []),
      ...(extraRoomDetails.marketDebt
        ? [
            {
              type: "text" as const,
              label: "Borxhi ne market",
              props: {
                value: extraRoomDetails.marketDebt,
                variant: "outlined",
                fullWidth: true,
                margin: "normal",
                disabled: true,
              },
            },
          ]
        : []),
      ...(extraRoomDetails.roomAmount
        ? [
            {
              type: "text" as const,
              label: "Borxhi total per dhome",
              props: {
                value: extraRoomDetails.roomAmount,
                variant: "outlined",
                fullWidth: true,
                margin: "normal",
                disabled: true,
              },
            },
          ]
        : []),
      ...(extraRoomDetails.roomDebt
        ? [
            {
              type: "text" as const,
              label: "Borxhi per Dhome",
              props: {
                value: extraRoomDetails.roomDebt,
                variant: "outlined",
                fullWidth: true,
                margin: "normal",
                disabled: true,
              },
            },
          ]
        : []),
      ...(extraRoomDetails.total
        ? [
            {
              type: "text" as const,
              label: "Totali",
              props: {
                value: extraRoomDetails.total,
                variant: "outlined",
                fullWidth: true,
                margin: "normal",
                disabled: true,
              },
            },
          ]
        : []),
      {
        type: "group" as const,
        fields: [
          {
            type: "button" as const,
            label: "Vazhdo",
            props: {
              variant: "contained",
              color: "info",
              onClick: handleContinueRoom,
            },
          },
          ...( (extraRoomDetails.roomDebt ?? 0) + (extraRoomDetails.marketDebt ?? 0) > 0 
          ? [
              {
                type: "button" as const,
                label: "Pagesa",
                props: {
                  variant: "contained",
                  color: "warning",
                  onClick: handlePaymentModal,
                },
              },
            ]
          : []),
          ...(timeLimit ? [
            {
              type:"button" as const,
              label:"Gabim",
              props: {
                variant: "contained",
                color: "error",
                onClick: handleMistakeModal,
              }

            }
          ]:[]),
          ...(timeLimit ? [
            {
              type:"button" as const,
              label:"Ndrro",
              props: {
                variant: "contained",
                color: "error",
                onClick: handleChangeRoom,
              }

            }
          ]:[]),
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "contained",
              color: "info",
              onClick: handleCloseRoom,
            },
          },
        ],
      },
    ];
  }, [extraRoomDetails]);

  const confirmFieldConfig = useMemo(() => {
    if (!paymentMessage) return [];

    return [
      {
        type: "description" as const,
        label: paymentMessage.data,
        props:{
          variant: "contained",
          color: "primary",
        }
      },
      {
        type: "group" as const,
        fields: [
          {
            type: "button" as const,
            label: "Konfirmo",
            props: {
              variant: "contained",
              color: "primary",
              onClick: handleAcceptPaymentRoom,
            },
          },
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "contained",
              color: "primary",
              onClick: () => setModalType(""),
            },
          },
        ],
      },
    ];
  }, [paymentMessage]);

  const mistakeFieldConfig = useMemo(() => {
    const message = "A jeni i sigurt qe doni te mbyllni dhomes sepse eshte gabim ? "

    return [
      {
        type: "description" as const,
        label: message,
        props:{
          variant: "contained",
          color: "primary",
        }
      },
      {
        type: "group" as const,
        fields: [
          {
            type: "button" as const,
            label: "Konfirmo",
            props: {
              variant: "contained",
              color: "primary",
              onClick: handleAcceptMistakeRoom,
            },
          },
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "contained",
              color: "primary",
              onClick: () => setModalType(""),
            },
          },
        ],
      },
    ];
  }, [activeRoom]);

  const changeFieldConfig = useMemo(() => {
    if (!activeRoom) return []
    return [
      {
        type: "select" as const,
        label: "Dhoma aktuale",
        options: [
          { value: activeRoom.title, label: activeRoom.title }, 
        ],
        props: {
          value: `${activeRoom.title}`,
          variant: "outlined",
          fullWidth: true,
          margin: "normal",
          disabled: true, 
        },
      },
      {
        type: "select" as const,
        label: "Dhoma ardhshme",
        options: openRooms,
        props: {
          value: openRoomDetails.newRoomNo || "",
          onChange: (e: React.ChangeEvent<{ value: unknown }>) => {
            const value = e.target.value as string;
            const selected = openRooms.find((t) => t.value === value);
            if (selected) {
              setOpenRoomDetails({
                ...openRoomDetails,
                newRoomNo: selected.value,
                newRoomTitle: selected.label,
              });
            }
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
              variant: "contained",
              color: "primary",
              onClick: handleAcceptChangeRoom,
            },
          },
          {
            type: "button" as const,
            label: "Mbyll",
            props: {
              variant: "contained",
              color: "primary",
              onClick: () => setModalType(""),
            },
          },
        ],
      },
    ];
  },[activeRoom, openRoomDetails]);


  return (
    <div className="main_container">
      <ToastContainer />
      <div className="dark_theme_container">
        <FormControlLabel
          control={<Switch checked={theme === "dark"} onChange={toggleTheme} />}
          label={theme === "light" ? "Switch to Dark" : "Switch to Light"}
        />
      </div>
      <div
        className="rooms_container"
        style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}
      >
        {allRooms.length > 0 ? (
          allRooms.map((room) => (
            <div
              key={room.roomNo}
              style={{
                height: "140px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <p style={{ textAlign: "center", fontSize: "14px" }}>
                {room.title}
              </p>
              <Card sx={{ width: "120px", boxShadow: "none" }}>
                <House
                  width={120}
                  height={140}
                  style={{
                    fill: room.isOpen
                      ? Colors(theme).houseBusyFill
                      : room.isExtraRoomType
                      ? Colors(theme).houseExtraFillColor
                      : Colors(theme).houseFreeFill,
                  }}
                  onClick={() => handleRoomClick(room)}
                />
              </Card>
            </div>
          ))
        ) : (
          <>Loading...</>
        )}
      </div>
      {modalType === "new" && activeRoom && (
        <div style={{ position: "relative", zIndex: 10 }}>
          <ModalFormMain
            fieldConfig={fieldConfig}
            onClose={() => setModalType("")}
            zIndex={10}
            theme={theme}
            key={`modal-new-${activeRoom.roomNo}`}
          />
        </div>
      )}
      {modalType === "details" && activeRoom && (
        <div style={{ position: "relative", zIndex: 10 }}>
          <ModalFormMain
            fieldConfig={detailsFieldConfig}
            onClose={() => setModalType("")}
            zIndex={10}
            theme={theme}
            key={`modal-details-${activeRoom.roomNo}`}
          />
        </div>
      )}
      {modalType === "continue" && activeRoom && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain
            fieldConfig={continueFieldConfig}
            onClose={() => setModalType("")}
            zIndex={20}
            theme={theme}
            key={`modal-continue-${activeRoom.roomNo}`}
          />
        </div>
      )}
      {modalType === "confirmPayment" && activeRoom && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain
            fieldConfig={confirmFieldConfig}
            onClose={() => setModalType("")}
            zIndex={20}
            theme={theme}
            key={`modal-confirm-${activeRoom.roomNo}`}
          />
        </div>
      )}
      {modalType === "mistake" && activeRoom && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain
            fieldConfig={mistakeFieldConfig}
            onClose={() => setModalType("")}
            zIndex={20}
            theme={theme}
            key={`modal-confirm-${activeRoom.roomNo}`}
          />
        </div>
      )}
      {modalType === "change" && activeRoom && (
        <div style={{ position: "relative", zIndex: 20 }}>
          <ModalFormMain
            fieldConfig={changeFieldConfig}
            onClose={() => setModalType("")}
            zIndex={20}
            theme={theme}
            key={`modal-confirm-${activeRoom.roomNo}`}
          />
        </div>
      )}
      
    </div>
  );
}
