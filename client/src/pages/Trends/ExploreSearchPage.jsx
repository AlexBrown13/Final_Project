import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import styles from "../AddictionsPage.module.css";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Text,
} from "recharts";

export default function ExploreSearchPage() {
  const [trendsData, setTrendsData] = useState(null);
  const [subjectFeatures, setSubjectFeatures] = useState([]);
  const [visibleFeatures, setVisibleFeatures] = useState(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        const { res, data } = await fetchExploreTrends();

        if (res.ok) {
          setTrendsData(data.data_trends);
          setSubjectFeatures(data.features);
          console.log(data.data_trends);
        } else {
          console.log("Request failed");
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setVisibleFeatures(new Set(subjectFeatures));
  }, [subjectFeatures]);

  /// temp
  async function fetchExploreTrends() {
    try {
      const res = await fetch(`http://localhost:5500/api/trends`);
      const data = await res.json();
      return { res, data };
    } catch (err) {
      return { res: { ok: false }, data: null };
    }
  }

  const colors = [
    {
      fill: "#2B77E5",
      stroke: "#8884d8",
    },
    {
      fill: "#82ca9d",
      stroke: "#4CAF50",
    },
    {
      fill: "#ff7300",
      stroke: "#E65100",
    },
    {
      fill: "#00C49F",
      stroke: "#009688",
    },
    {
      fill: "#FFBB28",
      stroke: "#F57F17",
    },
    {
      fill: "#FF8042",
      stroke: "#D84315",
    },
  ];

  const Graphs = ({ feature, color }) => {
    return (
      <AreaChart
        responsive
        data={trendsData || []}
        margin={{ top: 32, right: 0, left: 0, bottom: 0 }}
      >
        <Text
          x={25}
          y={0}
          dy={20}
          textAnchor="start"
          fontSize={15}
          fontWeight="bold"
          fill={color.fill}
        >
          {feature}
        </Text>

        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={false} />
        <YAxis domain={[0, 100]} ticks={[0, 50, 100]} />
        <Tooltip
          labelFormatter={(date) =>
            new Date(date).toLocaleString("en-US", {
              month: "short",
              year: "numeric",
            })
          }
        />
        <Area
          type="monotone"
          dataKey={feature}
          stroke={color.stroke}
          strokeWidth={4}
          fill={color.fill}
        />
      </AreaChart>
    );
  };

  const toggleFeature = (feature) => {
    setVisibleFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(feature)) next.delete(feature);
      else next.add(feature);
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <h2 className={styles.title}>Search Interest Over Time</h2>
        <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
          {subjectFeatures.map((feature, index) => (
            <ResponsiveContainer key={feature} width="100%" height={150}>
              <Graphs feature={feature} color={colors[index % colors.length]} />
            </ResponsiveContainer>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.6rem",
            marginBottom: "0.9rem",
          }}
        >
          {subjectFeatures.map((feature, index) => {
            const active = visibleFeatures.has(feature);
            const color = colors[index % colors.length];
            return (
              <button
                key={`card-${feature}`}
                type="button"
                onClick={() => toggleFeature(feature)}
                aria-pressed={active}
                style={{
                  border: `1px solid ${color.stroke}`,
                  background: active ? color.fill : "#fff",
                  color: active ? "#fff" : color.stroke,
                  borderRadius: "10px",
                  padding: "0.45rem 0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {feature}
              </button>
            );
          })}
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={trendsData || []}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleString("en-US", {
                  month: "short",
                  year: "2-digit",
                })
              }
            />
            <YAxis domain={[0, 100]} />
            <Tooltip
              labelFormatter={(date) =>
                new Date(date).toLocaleString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              }
            />
            <Legend />
            {subjectFeatures.map((feature, index) =>
              visibleFeatures.has(feature) ? (
                <Line
                  key={feature}
                  type="monotone"
                  dataKey={feature}
                  stroke={colors[index % colors.length].stroke}
                  strokeWidth={2}
                  dot={false}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </main>
    </div>
  );
}
