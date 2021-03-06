import DM from "./DM";

const ListDMs = ({DMs, list_dms, is_admin}) => {
    const sortedDMS = [].concat(DMs).sort((a,b)=>a.created_at>b.created_at?1:-1)
    const realDMS = sortedDMS.filter(d => !d.is_hidden);

    return ( 
        <div>
            {realDMS.map(
                (p, idx) => <DM
                    key={p.created_at}
                    user_poster_id={p.user_id}
                    message_id={p.message_id}
                    post_id={p.post_id}
                    text={p.text}
                    created_at={p.created_at}
                    list_dms={list_dms}
                    is_admin={is_admin}
                />
            )}
        </div>
    );
}
 
export default ListDMs;